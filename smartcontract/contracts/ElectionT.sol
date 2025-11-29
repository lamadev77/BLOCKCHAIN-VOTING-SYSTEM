// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// If you need OpenZeppelin later, use this format:
// import "@openzeppelin/contracts/access/Ownable.sol";

// Import your other contract files (make sure they are in the same folder or correctly pathed)
import "./Structure.sol";
import "./Constants.sol";  // Assuming you have gender_list here
import "./Candidate.sol";
import "./Voter.sol";
import "./Auth.sol";

contract ElectionT is Voter {

    // Mappings
    mapping(address => Party) public parties;
    mapping(string => Structure.Election) public elections;
    mapping(address => FAQ) public faqs;

    // Arrays
    Party[] public partyList;
    Structure.Election[] public electionList;
    FAQ[] public faqList;
    string[] public partyNames;

    // Counters
    uint public totalParty = 0;
    uint public totalElection = 0;

    // Events
    event VoterCreated(Voter voter);
    event ElectionStarted(Structure.Election election);
    event NewFaqAdded(FAQ faq);
    event FaqCommentAdded(address indexed faqId, address indexed commenter, string reply);

    // ============================
    // ADMIN: Add Party
    // ============================
    function addParty(
        string memory _name,
        uint _totalMember,
        string memory _agenda,
        string memory _logoUrl
    ) public payable onlyAdmin {
        address[] memory emptyArray;
        Party memory party = Party(
            adminAddress,
            _name,
            _totalMember,
            _agenda,
            _logoUrl,
            emptyArray
        );

        parties[adminAddress] = party;
        partyNames.push(_name);
        partyList.push(party);
        totalParty++;

        // PartyCreated event is inherited from Party contract if needed
    }

    // ============================
    // Candidate Registration
    // ============================
    function addCandidate(
        string memory _name,
        uint _citizenshipNo,
        uint _age,
        string memory _agenda,
        string memory _dob,
        string memory _email,
        string memory _profile,
        string memory _partyName,
        string memory _province,
        string memory _district,
        string memory _municipality,
        string memory _ward,
        string memory _gender
    ) public payable override {
        address _id = msg.sender;

        if (candidates[_id].user.citizenshipNumber != 0) {
            revert("Candidate already registered!");
        }

        updateGenderCounter(_gender);

        address[] memory votedVoterLists;
        Candidate memory candidate = Candidate(
            User(_id, _name, _citizenshipNo, _age, _gender, _dob, _email, _profile, _province, _district, _municipality, _ward),
            _partyName,
            "",
            _agenda,
            0,
            votedVoterLists
        );

        candidates[_id] = candidate;
        candidateNames.push(_name);
        candidateList.push(candidate);
        totalCandidate++;

        // CandidateCreated event is inherited from Candidate contract
    }

    // ============================
    // Voter Registration
    // ============================
    function addVoter(
        string memory _name,
        uint _citizenshipNo,
        uint _age,
        string memory _dob,
        string memory _email,
        string memory _profile,
        string memory _province,
        string memory _district,
        string memory _municipality,
        string memory _ward,
        string memory _gender
    ) public payable {
        address _id = msg.sender;

        // if (voters[_id].user.citizenshipNumber != 0) {
        //     revert("Voter already registered!");
        // }

        updateGenderCounter(_gender);

        address[] memory votedCandidateList;
        Voter memory voter = Voter(
            User(_id, _name, _citizenshipNo, _age, _gender, _dob, _email, _profile, _province, _district, _municipality, _ward),
            votedCandidateList,
            0
        );

        voters[_id] = voter;
        voterNames.push(_name);
        voterList.push(voter);
        totalVoter++;

        emit VoterCreated(voter);
    }

    // ============================
    // ADMIN: Create Election
    // ============================
    function createElection(
        string memory _title,
        string memory _description,
        string memory _startDate,
        string memory _endDate,
        string memory _electionType,
        string[] memory galleryImagesUrl
    ) public payable onlyAdmin {
        Candidate[] memory _candidates;
        Structure.Election memory election = Structure.Election(
            _title,
            _description,
            _startDate,
            _endDate,
            _electionType,
            _candidates,
            galleryImagesUrl
        );

        elections[_startDate] = election;
        electionList.push(election);
        totalElection++;

        emit ElectionStarted(election);
    }

    // ============================
    // ADMIN: Add Candidates to Election
    // ============================
    function addSelectedCandidates(
        address[] memory _selectedCandidates,
        string memory electionStartDate
    ) public payable onlyAdmin {
        Structure.Election storage election = elections[electionStartDate];
        for (uint i = 0; i < _selectedCandidates.length; i++) {
            Candidate memory _candidate = candidates[_selectedCandidates[i]];
            election.candidates.push(_candidate);
        }

        // Also update the array version
        for (uint i = 0; i < electionList.length; i++) {
            if (keccak256(bytes(electionList[i].startDate)) == keccak256(bytes(electionStartDate))) {
                for (uint j = 0; j < _selectedCandidates.length; j++) {
                    Candidate memory _candidate = candidates[_selectedCandidates[j]];
                    electionList[i].candidates.push(_candidate);
                }
                break;
            }
        }
    }

    // ============================
    // FAQ System
    // ============================
    function addFaq(
        string memory title,
        string memory description,
        string memory fileUrl,
        string memory createdAt
    ) public payable {
        address _id = msg.sender;
        ReplyComment[] memory replies;

        FAQ memory faq = FAQ(_id, title, description, fileUrl, createdAt, replies);
        faqs[_id] = faq;
        faqList.push(faq);

        emit NewFaqAdded(faq);
    }

    function addFaqComment(
        address faqId,
        string memory replyMsg,
        string memory createdAt
    ) public payable {
        ReplyComment memory reply = ReplyComment(msg.sender, replyMsg, createdAt);

        faqs[faqId].comments.push(reply);

        for (uint i = 0; i < faqList.length; i++) {
            if (faqList[i]._id == faqId) {
                faqList[i].comments.push(reply);
                break;
            }
        }

        emit FaqCommentAdded(faqId, msg.sender, replyMsg);
    }

    // ============================
    // Internal: Gender Counter
    // ============================
    function updateGenderCounter(string memory _gender) internal {
        if (keccak256(bytes(_gender)) == keccak256(bytes(gender_list[0]))) {
            totalMaleVoters++;
        } else if (keccak256(bytes(_gender)) == keccak256(bytes(gender_list[1]))) {
            totalFemaleVoters++;
        } else if (keccak256(bytes(_gender)) == keccak256(bytes(gender_list[2]))) {
            totalOtherVoters++;
        }
    }

    // ============================
    // Getters
    // ============================
    function getAllParties() public view returns (Party[] memory) {
        return partyList;
    }

    function getAllElections() public view returns (Structure.Election[] memory) {
        return electionList;
    }

    function getPartyDetails(address owner) public view returns (Party memory) {
        return parties[owner];
    }

    function getAllFAQs() public view returns (FAQ[] memory) {
        return faqList;
    }
}