import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Modal } from 'react-bootstrap';
import Select from "react-select";
import { toast } from 'react-toastify';
import { DISTRICT, ELECTION_TYPE, SmartContract } from '../constants/locales';
import { createElection, getHostedUrl } from '../utils/action';
import Avatar from './Avatar';
import { BsFacebook, BsInstagram, BsTwitter } from 'react-icons/bs';
import { getCandidateList, getElectionList } from '../utils';
import moment from 'moment';
import { setCurrentElection } from '../components/redux/reducers/commonReducer';
import { getStorage } from '../services';

const currentDate = new Date();
const defaultDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}T${currentDate.getHours()}:${currentDate.getMinutes()}`;
const defaultElectionData: any = {
  title: "",
  description: "",
  startDate: defaultDate,
  endDate: defaultDate,
  electionType: null,
  electionImages: null,
  selectedCandidates: []
}
const districtElectionPosition = [
  { label: "Mayor", value: "mayor" },
  { label: "Deputy Mayor", value: "deput_mayor" },
  { label: "Ward Councilor", value: "ward_councilor" }
]
let originalCandidateList: any = [];

const ElectionModal = ({ show, setShowCreateElectionModal }: any) => {
  const [election, setElection] = useState({ ...defaultElectionData });
  const [electionList, setElectionList] = useState([]);
  const [_candidateLists, setCandidateList] = useState([])
  const [isDisabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const loggedInAccountAddress = getStorage("loggedInAccountAddress");
  const [openCandidateModal, setOpenCandidateModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [boothPlace, setBoothPlace] = useState(null);
  const [recentlyCreatedElection, setRecentlyCreatedElection] = useState<any>(null);
  const dispatch = useDispatch();

  const fetchData = async () => {
    const elections = await getElectionList();
    const candidateLists = await getCandidateList();
    const currentElection = elections?.at(-1)

    originalCandidateList = [...candidateLists];
    setRecentlyCreatedElection(currentElection);
    setCandidateList(candidateLists);
    setElectionList(elections);

    if (!Object.keys(currentElection ?? {})?.length) return;
    const { title, description, startDate, endDate, electionType }: any = currentElection;
    dispatch(setCurrentElection({ title, description, startDate, endDate, electionType }));
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!recentlyCreatedElection?.candidates?.length && moment(recentlyCreatedElection?.endDate).isAfter(new Date())) {
      setElection({ ...election, electionType: recentlyCreatedElection?.electionType });
      setShowCreateElectionModal(false);
      setOpenCandidateModal(true);
    };
  }, [recentlyCreatedElection]);

  useEffect(() => {
    setDisabled(
      !election.title || !election.description || !election.startDate || !election.endDate
    );
  }, [election.title, election.description, election.startDate, election.endDate]);

  const onChange = (name: string, value: string) => {
    setElection({ ...election, [name]: value });

    if (name === "electionType") {
      setSelectedPosition(null);
      setElection({ ...defaultElectionData, electionType: value });
    }
  };

  const onCreate = async () => {
    setLoading(true);

    try {
      let { title, description, startDate, endDate, electionType, electionImages } = election;
      const formData = new FormData();

      if (!moment(startDate).isAfter(new Date()) || !moment(startDate).isBefore(endDate)) {
        setLoading(false);
        return toast.error("Please give correct datetime !")
      }

      Array.from(electionImages).forEach((file: any) => {
        formData.append("images", file);
      })

      await createElection({ title, description, startDate, endDate });
      const { url }: any = await getHostedUrl(formData);
      const galleryImagesUrl = url;

      await SmartContract.methods.createElection(
        title,
        description,
        startDate,
        endDate,
        electionType,
        galleryImagesUrl
      ).send({ from: loggedInAccountAddress });

      setShowCreateElectionModal(false);
      setOpenCandidateModal(true);

      fetchData();

      toast.success(`New ${election?.electionType?.toLowerCase()} election created successfully.`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create election !");
    }
    setLoading(false);
  }

  const onCandidateSelected = (checked: boolean, details: any) => {
    let temp = [...election.selectedCandidates];
    const _details = { ...details, position: selectedPosition };

    // only allow one person from specific party 
    if (election?.electionType === "District") {
      election.selectedCandidates.find((d) => {
        return d?.partyName === details?.partyName && d?.position === details?.position;
      })
    }

    if (!checked) temp = election.selectedCandidates.filter((candidate: any) => candidate?.user?._id !== details?.user?._id);
    else temp.push(_details);

    temp = temp.map((candidate: any) => ({ ...candidate, votedVoterLists: [] }));

    setElection({ ...election, selectedCandidates: temp });
  }

  const onOpenCandidateModal = () => {
    setOpenCandidateModal(!openCandidateModal);
  }

  const handleClose = () => {
    setElection(defaultElectionData);
    setShowCreateElectionModal(!show);
    setCandidateList([...originalCandidateList]);
    setBoothPlace(null);
  }

  const uploadSelectedCandidates = async () => {
    try {
      setLoading(true);
      const isLocalElection = election?.electionType === "Local";
      const selectedCandidates = election?.selectedCandidates?.map((candidate) => ({
        _id: candidate?.user?._id,
        position: isLocalElection ? "" : candidate?.position,
        votingBooth: isLocalElection ? "" : boothPlace
      }))?.filter((candidate: any) => isLocalElection ? true : (candidate?.position === selectedPosition && candidate?.votingBooth === boothPlace));

      if (isLocalElection && selectedCandidates?.length > 2) return toast.warning("Only 2 candidates are allow for binary election !!");
      console.log(selectedCandidates, recentlyCreatedElection?.startDate)
      await SmartContract.methods.addSelectedCandidates(selectedCandidates, recentlyCreatedElection?.startDate).send({ from: loggedInAccountAddress });

      const filterCandidates = _candidateLists?.filter((candidate: any) => !election.selectedCandidates.some((_candidate: any) => _candidate.user._id === candidate.user._id))
      setCandidateList([...filterCandidates]);

      setLoading(false);
      setBoothPlace(null);
      setOpenCandidateModal(!isLocalElection);

      fetchData();

      toast.success("Selected candidates added successfully.");
    } catch (error) {
      console.log(error)
      setLoading(false);
      setBoothPlace(null);
      toast.error("Fail to add selected candidates !");
    }
  }

  const districtOptions: any = [];
  Object.keys(DISTRICT).forEach((key) => DISTRICT[key].forEach((options: object) => districtOptions.push(options)));

  return (
    <>
      <Modal show={openCandidateModal} size='xl'>
        <Modal.Body className='px-4'>
          <h4 className='my-3'>Candidate Selection</h4>
          {election?.electionType === "District" &&
            <div className='flex sm:flex-row xsm:flex-col'>
              <div className='w-[300px] my-4'>
                <span>Select Candidate Position</span>
                <Select
                  className='mt-1'
                  options={districtElectionPosition}
                  placeholder="Select Position"
                  onChange={({ label, value }) => {
                    setSelectedPosition(value);
                  }}
                  isDisabled={election.selectedCandidates.filter((candidate: any) => candidate.position === selectedPosition).length > 3 || !boothPlace}
                />
              </div>
              <div className='w-[300px] my-4 ml-4'>
                <span>Select District</span>
                <Select
                  className='mt-1'
                  options={districtOptions}
                  placeholder="Select District"
                  onChange={({ label, value }) => {
                    setBoothPlace(value);
                  }}
                />
              </div>
            </div>
          }
          <div className='flex flex-wrap'>
            {(_candidateLists && _candidateLists?.length > 0) ?
              _candidateLists.map((details: any) => {
                if (election.selectedCandidates?.find((d:any) => d?.user?._id === details?.user?._id && d?.position !== selectedPosition)) return;

                const formattedEmail = details?.user?.email.split("@")[0];
                const isLocalElection = election?.electionType === "Local";
                const isCandidateSelected = () => {
                  if (isLocalElection) return election.selectedCandidates?.find((candidate:any) => candidate?.user?._id === details?.user?._id);
                  return election.selectedCandidates?.find((candidate:any) => candidate?.position === selectedPosition && candidate?.user?._id === details?.user?._id);
                };
                const isBinaryElection = isLocalElection && election?.selectedCandidates?.length >= 2 && !isCandidateSelected();
                const isCheckboxDisabled = () => {
                  if (!isLocalElection) {
                    return !selectedPosition || election.selectedCandidates.find((candidate:any) => candidate.partyName === details.partyName
                      && candidate.position === selectedPosition && candidate.user._id !== details.user._id || details.boothPlace !== candidate.boothPlace);

                  } else { return isBinaryElection }
                };


                return (
                  <div className='user__card h-[180px] w-[340px] px-2 mb-3 mr-4 max-[500px]:w-[500px] max-[400px]:w-full bg-slate-100 rounded-[12px] hover:bg-red-20'>
                    <div className={`absolute m-2 p-2 shadow-lg border-[1px] ${!isCheckboxDisabled() ? "bg-white border-slate-500" : "bg-slate-200"} rounded-circle h-[45px] w-[45px] flex justify-center items-center`}>
                      <input
                        className={`h-[20px] w-[20px] ${!isCheckboxDisabled() && "cursor-pointer"}`}
                        type="checkbox"
                        onClick={(e: any) => {
                          onCandidateSelected(e.target.checked, details);
                        }}
                        key={details?.user?.citizenshipNumber}
                        checked={isCandidateSelected()}
                        disabled={isCheckboxDisabled()}
                      />
                    </div>
                    <div className='flex justify-around items-center mt-4'>
                      <div className='col1 flex-col'>
                        <Avatar src={details?.user?.profile} className={''} alt={'img'} size={'xl'} border={0} />
                        <div className='social__media flex justify-center mt-3'>
                          <BsFacebook className='cursor-pointer hover:text-md hover:text-red-500 hover:animate-bounce' />
                          <BsInstagram className='mx-4 cursor-pointer hover:text-md hover:text-red-500 hover:animate-bounce' />
                          <BsTwitter className='cursor-pointer hover:text-md hover:text-red-500 hover:animate-bounce' />
                        </div>
                      </div>
                      <div className='col2 pr-1 h-fit flex-xl-column text-[15px] ml-1'>
                        <div>Name: {details?.user?.fullName}</div>
                        <div>Citizenship No: {details?.user?.citizenshipNumber}</div>
                        <div>Age: {details?.user?.age}</div>
                        <div>Party: {details?.partyName}</div>
                        <div>Email: {formattedEmail}</div>
                      </div>
                    </div>
                  </div >
                )
              }) : "No Candidates Available !"}
          </div >
        </Modal.Body >
        <Modal.Footer>
          <button
            className="btn bg-light px-4"
            onClick={() => {
              setOpenCandidateModal(false);
            }}
          >Close</button>
          <button
            className="btn bg-btnColor px-4 text-light"
            onClick={() => {
              uploadSelectedCandidates();
            }}
          >{loading ? "Uploading..." : "Upload Selected Candidates"}</button>
        </Modal.Footer >
      </Modal >
      <Modal show={show} centered>
        <Modal.Header className='pt-4 pb-3 px-4'>
          <h5>Create new election</h5>
        </Modal.Header>
        <Modal.Body>
          <div className='px-2'>
            <div className='w-full mb-4'>
              <div className='w-100'>
                <label>Election Type</label>
                <Select
                  options={ELECTION_TYPE}
                  className="mr-2 mt-1"
                  placeholder={<div>Select Type</div>}
                  onChange={(item: any) => onChange("electionType", item.value)}
                />
              </div>
            </div>
            <div className='flex flex-column'>
              <label>Election Title</label>
              <input
                type="text"
                className='form-control mt-2 mb-4 shadow-none'
                onChange={(e) => onChange("title", e.target.value)} />
            </div>
            <div className='flex flex-column'>
              <label>Short Election Description</label>
              <textarea
                className='form-control mt-2 mb-4 shadow-none h-[130px]'
                onChange={(e) => onChange("description", e.target.value)}>
              </textarea>
            </div>
            <div className='hold__date flex '>
              <div className='w-50 mr-2'>
                <span>Start Date & time</span>
                <input
                  type="datetime-local"
                  className="form-control mt-1 shadow-none"
                  value={election.startDate}
                  onChange={(e) => onChange("startDate", e.target.value)} />
              </div>
              <div className='w-50 ml-2'>
                <span>End Date & time</span>
                <input
                  type="datetime-local"
                  value={election.endDate}
                  className="form-control mt-1 shadow-none"
                  onChange={(e) => onChange("endDate", e.target.value)} />
              </div>
            </div>
            <div className='w-full mt-4'>
              <label>Choose election images</label>
              <input
                className='form-control mt-2'
                type="file"
                name='files'
                multiple
                onChange={(e: any) => setElection({ ...election, electionImages: e.target.files })}
              />
            </div>
            <button
              className={`h-fit w-full flex items-center mt-4 rounded-3 border border-1 border-slate-400 bg-slate-200 ${recentlyCreatedElection ? election?.electionType && "cursor-pointer hover:bg-slate-100" : "hidden"}`}
              onClick={onOpenCandidateModal}
              disabled={!recentlyCreatedElection?.length}
              onMouseOver={() => {
                // if (!election?.electionType) showTooltip
              }}
            >
              <span className='flex-shrink px-[14px] text-dark'>Open modal</span>
              <div className='bg-white flex-1 text-start px-3 py-[8px] text-slate-800'>{
                !_candidateLists?.length ? "Candidates not found !" :
                  (!recentlyCreatedElection ? "Choose candidates" : `Selected Candidates: ${election.selectedCandidates?.length}`)
              }</div>
            </button>
          </div >
        </Modal.Body >
        <Modal.Footer>
          <button className='me-4' onClick={handleClose}>Close</button>
          <button
            className={`bg-blue-900 text-light py-1 w-[130px] rounded-[5px] hover:opacity-75 flex justify-center items-center ${(isDisabled || loading) && 'opacity-75 cursor-default'}`}
            onClick={onCreate}
            disabled={isDisabled || loading}
          >
            {loading ? "Saving" : "Register"}
          </button>
        </Modal.Footer>
      </Modal >
    </>
  )
}

export default ElectionModal;
