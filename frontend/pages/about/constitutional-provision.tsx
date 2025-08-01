import { useTranslations } from 'next-intl';
import Head from 'next/head';
import React from 'react';
import Navbar from '../../components/Navbar';
import { responsive } from '.../constants/locale';

const ConstitutionalProvision = () => {
  const t = useTranslations("constitutional_provision");

  return (
    <div className='constitutional--provision--container'>
      <Head>
        <title>{t("constitutional_provision")}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href={"/images/logo.png"} />
      </Head>
      <Navbar />
      <div className='flex justify-center mt-3 mb-5 px-3 lg:px-0'>
        <div className={`${responsive} flex justify-between rounded-1 flex-wrap lg:px-3`}>
          <div>
            <h4 className='my-2'>{t("constitutional_provision")}</h4>
            <p className='m-0 lg:ml-5'>{t("description1")}</p>
          </div>
          <div>
            <h4 className='my-2'>{t("election_commission")}</h4>
            <div className='p-0 lg:pl-5'>
              <p>{t("description2_point1")}</p>
              <p>{t("description2_point2")}</p>
              <p>{t("description2_point3")}</p>
              <p>{t("description3_point4")}</p>
              <div className='pl-10 -mt-3 mb-3 flex flex-column'>
                <span>{t("description4_point4_a")}</span>
                <span>{t("description4_point4_b")}</span>
                <span>{t("description4_point4_c")}</span>
                <span>{t("description4_point4_d")}</span>
                <span>{t("description4_point4_e")}</span>
              </div>
              <p>{t("description5")}</p>
              <p>{t("description6")}</p>
              <p>{t("description7")}</p>
              <div className='pl-10 -mt-3 mb-3 flex flex-column'>
                <span>{t("description7_point1")}</span>
                <span>{t("description7_point2")}</span>
                <span>{t("description7_point3")}</span>
                <span>{t("description7_point4")}</span>
              </div>
              <p>{t("description8")}</p>
              <p>{t("description8_a")}</p>
            </div>
            <p>{t("description8_b")}</p>
          </div>
          <div>
            <h4>{t("function_duties_power")}</h4>
            <div className='p-0 lg:pl-5 mb-3 flex flex-column'>
              <span>{t("description9")}</span>
              <span>{t("description10")}</span>
              <span>{t("description11")}</span>
              <span>{t("description12")}</span>
              <span>{t("description13")}</span>
            </div>
          </div>
          <div>
            <h4>{t("neccessary_cooperation")}</h4>
            <div className='p-0 lg:pl-5 mb-3 flex flex-column'>
              <span>{t("description14")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConstitutionalProvision;
