"use client";

import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" aria-label="TIAL notifications" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)} className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor" /></svg>
      </button>
      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="absolute -left-13.5 mt-4.25 flex w-80 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg sm:w-90.25 xl:right-0 xl:left-auto dark:border-gray-800 dark:bg-gray-dark">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">TIAL notifications</h2>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Close notifications" className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">×</button>
        </div>
        <div className="flex flex-col items-center px-3 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f0e4] text-[#8a7042]" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 2.5a5 5 0 0 0-5 5v3.1l-1.2 2.1h12.4L15 10.6V7.5a5 5 0 0 0-5-5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 15a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></span>
          <p className="mt-4 text-sm font-semibold text-gray-800 dark:text-white">No TIAL notifications</p>
          <p className="mt-1 max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">Only verified TIAL store and admin events will appear here. No activity has been connected to this panel yet.</p>
        </div>
      </Dropdown>
    </div>
  );
}
