import { useEffect, useState } from "react";

interface ResetTimes {
  dailyCountdown: string;
  weeklyCountdown: string;
  fashionCountdown: string;
  fashionStatus: string;
  fashionOpen: boolean;
  jumboCountdown: string;
  jumboLocal: string;
  oceanCountdown: string;
  oceanLocal: string;
  oceanOpen: boolean;
  verminionCountdown: string;
  verminionStatus: string;
  verminionLocal: string;
  verminionOpen: boolean;
  dailyLocal: string;
  weeklyLocal: string;
  timezone: string;
}

const getResetTimes = (): ResetTimes => {
  const now = new Date();

  // daily reset
  const dailyReset = new Date(now);
  dailyReset.setUTCHours(15, 0, 0, 0);
  if (now >= dailyReset) dailyReset.setUTCDate(dailyReset.getUTCDate() + 1);

  // weekly reset
  const weeklyReset = new Date(now);
  weeklyReset.setUTCHours(8, 0, 0, 0);
  const currentDay = now.getUTCDay();
  const daysUntilTuesday = currentDay < 2 ? 2 - currentDay : 9 - currentDay;
  weeklyReset.setUTCDate(now.getUTCDate() + daysUntilTuesday);
  if (currentDay === 2 && now.getUTCHours() >= 13) {
    weeklyReset.setUTCDate(weeklyReset.getUTCDate() + 7);
  }

  // fashion report
  const fashionOpen =
    currentDay === 5 ||
    currentDay === 6 ||
    currentDay === 0 ||
    currentDay === 1 ||
    (currentDay === 2 && now.getUTCHours() < 8);

  const fashionReset = new Date(now);
  fashionReset.setUTCHours(8, 0, 0, 0);

  if (fashionOpen) {
    // open: count down to Tuesday close
    const daysUntilTue = currentDay <= 2 ? 2 - currentDay : 9 - currentDay;
    fashionReset.setUTCDate(now.getUTCDate() + daysUntilTue);
  } else {
    // closed: count down to Friday open
    const daysUntilFri = currentDay < 5 ? 5 - currentDay : 12 - currentDay;
    fashionReset.setUTCDate(now.getUTCDate() + daysUntilFri);
  }

  // jumbo cactpot: every Saturday at 08:00 UTC
  const jumboReset = new Date(now);
  jumboReset.setUTCHours(8, 0, 0, 0);
  const daysUntilSaturday = currentDay <= 6 ? 6 - currentDay : 0;
  jumboReset.setUTCDate(now.getUTCDate() + daysUntilSaturday);
  if (currentDay === 6 && now.getUTCHours() >= 8) {
    jumboReset.setUTCDate(jumboReset.getUTCDate() + 7);
  }

  // ocean fishing: next even hour, after registration window (15min)
  const currentHour = now.getUTCHours();
  const currentMin = now.getUTCMinutes();
  const isEvenHour = currentHour % 2 === 0;
  const oceanOpen = isEvenHour && currentMin < 15;

  const oceanFishing = new Date(now);

  if (oceanOpen) {
    // countdown to window close: current even hour + 15 min
    oceanFishing.setUTCHours(currentHour, 15, 0, 0);
  } else {
    // countdown to next even hour
    const nextEvenHour = isEvenHour
      ? currentHour + 2
      : currentHour + (2 - (currentHour % 2));
    oceanFishing.setUTCHours(nextEvenHour % 24, 0, 0, 0);
    if (nextEvenHour >= 24)
      oceanFishing.setUTCDate(oceanFishing.getUTCDate() + 1);
  }

  // verminion tournament: 8-day cycle, 3 days active
  const VERMINION_EPOCH = new Date("2026-05-28T15:00:00Z").getTime();
  const VERMINION_CYCLE = 8 * 24 * 60 * 60 * 1000;
  const VERMINION_DURATION = 3 * 24 * 60 * 60 * 1000;

  const msIntoCurrentCycle =
    (now.getTime() - VERMINION_EPOCH) % VERMINION_CYCLE;
  const verminionOpen = msIntoCurrentCycle < VERMINION_DURATION;

  const verminion = new Date(now);
  if (verminionOpen) {
    // time until this tournament ends
    const msUntilEnd = VERMINION_DURATION - msIntoCurrentCycle;
    verminion.setTime(now.getTime() + msUntilEnd);
  } else {
    // time until next tournament starts
    const msUntilNext = VERMINION_CYCLE - msIntoCurrentCycle;
    verminion.setTime(now.getTime() + msUntilNext);
  }

  // formatting
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((ms % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };

  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return {
    dailyCountdown: formatTime(dailyReset.getTime() - now.getTime()),
    weeklyCountdown: formatTime(weeklyReset.getTime() - now.getTime()),
    dailyLocal: dailyReset.toLocaleTimeString([], timeOpts),
    weeklyLocal: weeklyReset.toLocaleTimeString([], timeOpts),
    fashionCountdown: formatTime(fashionReset.getTime() - now.getTime()),
    fashionStatus: fashionOpen ? "✓" : "◉",
    fashionOpen: fashionOpen,
    jumboCountdown: formatTime(jumboReset.getTime() - now.getTime()),
    jumboLocal:
      jumboReset.toLocaleDateString([], { weekday: "short" }) +
      " " +
      jumboReset.toLocaleTimeString([], timeOpts),
    oceanCountdown: formatTime(oceanFishing.getTime() - now.getTime()),
    oceanLocal: oceanFishing.toLocaleTimeString([], timeOpts),
    oceanOpen: oceanOpen,
    verminionCountdown: formatTime(verminion.getTime() - now.getTime()),
    verminionStatus: verminionOpen ? "✓" : "◉",
    verminionLocal: verminion.toLocaleTimeString([], dateOpts),
    verminionOpen: verminionOpen,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

const ResetTimers = () => {
  const [resets, setResets] = useState<ResetTimes>(getResetTimes());

  useEffect(() => {
    const interval = setInterval(() => {
      setResets(getResetTimes());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="reset-timers">
      <h2>Resets</h2>
      <table className="reset-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Countdown</th>
            <th>Local Time ({resets.timezone})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Daily</td>
            <td>{resets.dailyCountdown}</td>
            <td>{resets.dailyLocal}</td>
          </tr>
          <tr>
            <td>Weekly</td>
            <td>{resets.weeklyCountdown}</td>
            <td>Tue {resets.weeklyLocal}</td>
          </tr>
          <tr>
            <td>Jumbo Cactpot</td>
            <td>{resets.jumboCountdown}</td>
            <td>{resets.jumboLocal}</td>
          </tr>
          <tr>
            <td>
              Fashion Report{" "}
              <span
                style={{ color: resets.fashionOpen ? "#7ec87e" : "#e0b85a" }}
              >
                {resets.fashionStatus}
              </span>
            </td>
            <td style={{ color: resets.fashionOpen ? "#7ec87e" : "#e0b85a" }}>
              {resets.fashionCountdown}
            </td>
            <td>
              {resets.fashionStatus === "◉" ? "Fri" : "Tue"}{" "}
              {resets.weeklyLocal}
            </td>
          </tr>
          <tr>
            <td>
              Verminion Tournament{" "}
              <span
                style={{ color: resets.verminionOpen ? "#7ec87e" : "#e0b85a" }}
              >
                {resets.verminionStatus}
              </span>
            </td>
            <td style={{ color: resets.verminionOpen ? "#7ec87e" : "#e0b85a" }}>
              {resets.verminionCountdown}
            </td>
            <td>{resets.verminionOpen ? "Active" : resets.verminionLocal}</td>
          </tr>
          <tr>
            <td>
              Ocean Fishing{" "}
              <span style={{ color: resets.oceanOpen ? "#7ec87e" : "#e0b85a" }}>
                {resets.oceanOpen ? "✓" : "◉"}
              </span>
            </td>
            <td style={{ color: resets.oceanOpen ? "#7ec87e" : "#e0b85a" }}>
              {resets.oceanCountdown}
            </td>
            <td>{resets.oceanLocal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ResetTimers;
