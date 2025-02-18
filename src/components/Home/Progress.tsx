import React from "react";
import { LuSend } from "react-icons/lu";
import { MdHowToVote } from "react-icons/md";
import { LuAward } from "react-icons/lu";

export default function Progress() {
  // Calculate percentage of month completed
  const testDate = null;
  const today = testDate || new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const currentDay = today.getDate();

  const calculateWidth = (days: number) => {
    let out = 0;
    if (days <= 10) {
      // First 10 days (33.33% of width)
      out = (days / 10) * 33.33;
    } else if (days <= 25) {
      // Days 11-25 (50% of width)
      // Start from 33.33% on day 11 (not day 12)
      out = 33.33 + ((days - 10) / 15) * 50;
    } else {
      // Remaining days (16.67% of width)
      out = 83.33 + ((days - 25) / (daysInMonth - 25)) * 16.67;
    }
    return out * 1.02;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleString("default", { month: "long" });
  };

  return (
    <div className="flex w-3/4 sm:w-3/4 top-12 items-center justify-center absolute text-background sm:top-6 rounded-lg overflow-hidden shadow-lg gap-1">
      {/* Left */}
      <div className="text-lg justify-center xl:justify-between items-center flex text-start flex-[2] py-4 pr-2 pl-4 font-semibold bg-foreground rounded-l-lg rounded-r-sm">
        <LuSend />
        <div className="text-sm hidden xl:block">
          {getMonthName(today)} 1 - 10
        </div>
      </div>
      {/* Middle */}
      <div className="text-lg justify-center xl:justify-between items-center flex text-center border-l border-white/10 flex-[3] py-4 px-2 font-semibold rounded-sm bg-foreground">
        <MdHowToVote />
        <div className="text-sm hidden xl:block">
          {getMonthName(today)} 11 - 25
        </div>
      </div>
      {/* Right */}
      <div className="text-lg justify-center xl:justify-between items-center flex text-end flex-[1] border-l border-white/10 py-4 pr-4 pl-2 font-semibold rounded-r-lg rounded-l-sm bg-foreground">
        <LuAward />
        <div className="text-sm hidden xl:block">
          {getMonthName(today)} 26 - {daysInMonth}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#CC444B] via-[#F3A712] to-[#CC444B] rounded-tr-lg transition-all duration-500 ease-in-out animate-gradient bg-[length:200%_100%]"
          style={{ width: `${calculateWidth(currentDay)}%` }}
        />
      </div>
    </div>
  );
}
