import React, { useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';

const About = () => {
  useEffect(() => { document.title = 'About — SafeGuard'; }, []);

  return (
    <PageWrapper className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-10 sm:px-6 sm:py-14">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-navy-light sm:p-10">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 sm:h-24 sm:w-24">
            <svg className="h-10 w-10 text-primary sm:h-12 sm:w-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" /></svg>
          </div>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-navy dark:text-white sm:text-4xl">About SafeGuard</h1>
        <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
          SafeGuard is a comprehensive emergency response platform designed to bridge the gap between citizens in distress and immediate help. By leveraging real-time data, AI analysis, and community networks, we ensure that every cry for help is heard and acted upon swiftly.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow dark:bg-navy-light sm:p-6">
          <h3 className="mb-2 text-lg font-bold text-navy dark:text-white">Our Mission</h3>
          <p className="text-sm leading-relaxed text-gray-500">To reduce response times during crises by empowering communities with smart, accessible tools.</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow dark:bg-navy-light sm:p-6">
          <h3 className="mb-2 text-lg font-bold text-navy dark:text-white">Our Vision</h3>
          <p className="text-sm leading-relaxed text-gray-500">A world where no disaster results in unnecessary loss due to delayed communication.</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow dark:bg-navy-light sm:p-6">
          <h3 className="mb-2 text-lg font-bold text-navy dark:text-white">Contact Us</h3>
          <p className="text-sm leading-relaxed text-gray-500">support@safeguard.com<br />1-800-SAFE-000</p>
        </div>
      </section>
    </PageWrapper>
  );
};

export default About;
