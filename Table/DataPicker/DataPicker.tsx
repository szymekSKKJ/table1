"use client";

import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";
import ClickEffect from "./ClickEffect/ClickEffect";
import React from "react";

// const varela_Round = Varela_Round({ subsets: ["latin"], weight: ["400"] });

const IconLeft = ({ color }: { color: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
      <path
        fill={color}
        d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
      />
    </svg>
  );
};

const IconRight = ({ color }: { color: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
      <path
        fill={color}
        d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
      />
    </svg>
  );
};

const IconClock = ({ color }: { color: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        fill={color}
        d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
      />
    </svg>
  );
};

const IconCalendar = ({ color }: { color: string }) => {
  return (
    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        stroke={color}
        d="M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 15H8M11 15H13M16 15H18M6 18H8M11 18H13M16 18H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

interface componentProps {
  initialDate?: Date;
  onSave: (date: Date) => void;
  style?: {
    fontColor: string;
    backgrondColor: string;
    borderColor?: string;
    hoverColor?: string;
    borderRadius?: string;
    componentBorderRadius?: string;
  };
  type?: "date-time" | "only-time";
  locale?: Intl.LocalesArgument;
}

const DataPicker = ({ onSave, style, initialDate = new Date(), type = "date-time", locale }: componentProps) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [areMonthsOpen, setAreMonthsOpen] = useState(false);
  const [areYearsOpen, setAreYearsOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(type === "only-time" ? true : false);

  const componentElementRef = useRef<null | HTMLDivElement>(null);
  const hoursTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minutesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const minutesElementRef = useRef<HTMLDivElement | null>(null);
  const hoursElementRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    onSave(currentDate);
  }, [currentDate]);

  useLayoutEffect(() => {
    if (componentElementRef.current) {
      style?.hoverColor && componentElementRef.current.style.setProperty("--hover-color", style.hoverColor);
      style?.borderColor && componentElementRef.current.style.setProperty("--border-color", style.borderColor);
      style?.borderRadius && componentElementRef.current.style.setProperty("--border-radius", style.borderRadius);
      style?.backgrondColor && componentElementRef.current.style.setProperty("--background-color", style.backgrondColor);
      style?.fontColor && componentElementRef.current.style.setProperty("--font-color", style.fontColor);
      style?.componentBorderRadius && componentElementRef.current.style.setProperty("--componentBorderRadius", style.componentBorderRadius);
    }
  }, [style]);

  const copiedCurrentDate = structuredClone(currentDate);
  const copiedCurrentDateMonth = copiedCurrentDate.getMonth();

  const days = [];
  const months = [];
  const years = [];
  const dayNames = [];

  copiedCurrentDate.setDate(1);

  const offest = copiedCurrentDate.getDay() === 0 ? 6 : copiedCurrentDate.getDay() - 1;

  for (let i = 0; i < offest; i++) {
    days.push("");
  }

  while (copiedCurrentDate.getMonth() === copiedCurrentDateMonth) {
    days.push(copiedCurrentDate.getDate());
    copiedCurrentDate.setDate(copiedCurrentDate.getDate() + 1);
  }

  copiedCurrentDate.setTime(currentDate.getTime());

  copiedCurrentDate.setMonth(0);

  for (let i = 0; i <= 11; i++) {
    months.push(
      copiedCurrentDate.toLocaleDateString(locale, {
        month: "short",
      })
    );

    copiedCurrentDate.setMonth(copiedCurrentDate.getMonth() + 1);
  }

  copiedCurrentDate.setTime(currentDate.getTime());

  copiedCurrentDate.setFullYear(copiedCurrentDate.getFullYear() - 5);

  for (let i = 0; i <= 11; i++) {
    years.push(copiedCurrentDate.getFullYear());

    copiedCurrentDate.setFullYear(copiedCurrentDate.getFullYear() + 1);
  }

  copiedCurrentDate.setTime(currentDate.getTime());

  copiedCurrentDate.setDate(copiedCurrentDate.getDate() - copiedCurrentDate.getDay() + 1);

  for (let i = 0; i <= 6; i++) {
    dayNames.push(
      copiedCurrentDate.toLocaleDateString(locale, {
        weekday: "short",
      })
    );

    copiedCurrentDate.setDate(copiedCurrentDate.getDate() + 1);
  }

  useEffect(() => {
    hoursElementRef.current!.scrollTop = ((hoursElementRef.current!.scrollHeight - (hoursElementRef.current!.offsetHeight - 35)) / 24) * currentDate.getHours();
    minutesElementRef.current!.scrollTop =
      ((minutesElementRef.current!.scrollHeight - (minutesElementRef.current!.offsetHeight - 36)) / 60) * currentDate.getMinutes();
  }, []);

  return (
    <div ref={componentElementRef} className={`${styles.dataPicker}`} tabIndex={1000}>
      <div className={`${styles.header}`}>
        <button
          onClick={() => {
            if (areYearsOpen) {
              setCurrentDate((currentValue) => {
                const copiedCurrentValue = structuredClone(currentValue);

                copiedCurrentValue.setFullYear(copiedCurrentValue.getFullYear() - 12);
                copiedCurrentValue.setDate(1);

                return copiedCurrentValue;
              });
            } else {
              setCurrentDate((currentValue) => {
                const copiedCurrentValue = structuredClone(currentValue);

                copiedCurrentValue.setMonth(copiedCurrentValue.getMonth() - 1);
                copiedCurrentValue.setDate(1);

                return copiedCurrentValue;
              });
            }
          }}>
          <div className={`${styles.icon}`}>
            <IconLeft color={style ? style.fontColor : "white"}></IconLeft>
          </div>
          <ClickEffect></ClickEffect>
        </button>
        <p
          tabIndex={0}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              setAreMonthsOpen((currentValue) => {
                if (currentValue === true && areYearsOpen === false) {
                  setAreYearsOpen(true);
                }
                return true;
              });
            }
          }}
          onClick={() => {
            setAreMonthsOpen((currentValue) => {
              if (currentValue === true && areYearsOpen === false) {
                setAreYearsOpen(true);
              }
              return true;
            });
          }}>
          {currentDate.toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          <ClickEffect></ClickEffect>
        </p>
        <button
          onClick={() => {
            if (areYearsOpen) {
              setCurrentDate((currentValue) => {
                const copiedCurrentValue = structuredClone(currentValue);

                copiedCurrentValue.setFullYear(copiedCurrentValue.getFullYear() + 12);
                copiedCurrentValue.setDate(1);

                return copiedCurrentValue;
              });
            } else {
              setCurrentDate((currentValue) => {
                const copiedCurrentValue = structuredClone(currentValue);

                copiedCurrentValue.setMonth(copiedCurrentValue.getMonth() + 1);
                copiedCurrentValue.setDate(1);

                return copiedCurrentValue;
              });
            }
          }}>
          <div className={`${styles.icon}`}>
            <IconRight color={style ? style.fontColor : "white"}></IconRight>
          </div>
          <ClickEffect></ClickEffect>
        </button>
      </div>
      <div className={`${styles.dayNames} ${areMonthsOpen || areYearsOpen ? styles.close : ""}`}>
        {dayNames.map((value) => {
          return (
            <div key={value} className={`${styles.dayName}`}>
              {value}
            </div>
          );
        })}
      </div>
      <div className={`${styles.content}`}>
        <div className={`${styles.years} ${areYearsOpen ? styles.open : ""}`}>
          {years.map((value, index) => {
            return (
              <div
                tabIndex={areYearsOpen ? 0 : -1}
                key={index}
                className={`${styles.year} ${currentDate.getFullYear() === value ? styles.current : ""}`}
                onKeyUp={(event) => {
                  if (event.key === "Enter") {
                    setAreYearsOpen(false);
                    setCurrentDate((currentValue) => {
                      const copiedCurrentValue = structuredClone(currentValue);

                      copiedCurrentValue.setFullYear(value);

                      return copiedCurrentValue;
                    });
                  }
                }}
                onClick={() => {
                  setAreYearsOpen(false);
                  setCurrentDate((currentValue) => {
                    const copiedCurrentValue = structuredClone(currentValue);

                    copiedCurrentValue.setFullYear(value);

                    return copiedCurrentValue;
                  });
                }}>
                {value}
                <ClickEffect></ClickEffect>
              </div>
            );
          })}
        </div>
        <div className={`${styles.months} ${areMonthsOpen ? styles.open : ""}`}>
          {months.map((value, index) => {
            return (
              <div
                tabIndex={areMonthsOpen ? 0 : -1}
                key={index}
                className={`${styles.month} ${currentDate.getMonth() === index ? styles.current : ""}`}
                onKeyUp={(event) => {
                  if (event.key === "Enter") {
                    setAreMonthsOpen(false);
                    setCurrentDate((currentValue) => {
                      const copiedCurrentValue = structuredClone(currentValue);

                      copiedCurrentValue.setDate(1);
                      copiedCurrentValue.setMonth(index);

                      return copiedCurrentValue;
                    });
                  }
                }}
                onClick={() => {
                  setAreMonthsOpen(false);
                  setCurrentDate((currentValue) => {
                    const copiedCurrentValue = structuredClone(currentValue);

                    copiedCurrentValue.setDate(1);
                    copiedCurrentValue.setMonth(index);

                    return copiedCurrentValue;
                  });
                }}>
                {value}
                <ClickEffect></ClickEffect>
              </div>
            );
          })}
        </div>
        <div className={`${styles.days}`}>
          {days.map((value, index) => {
            return (
              <div
                tabIndex={value === "" ? -1 : 0}
                key={index}
                className={`${styles.day} ${value === currentDate.getDate() ? styles.current : ""} ${value === "" ? styles.empty : ""}`}
                onClick={() => {
                  setCurrentDate((currentValue) => {
                    const copiedCurrentValue = structuredClone(currentValue);

                    if (typeof value !== "string") {
                      copiedCurrentValue.setDate(value);
                    }

                    return copiedCurrentValue;
                  });
                }}
                onKeyUp={(event) => {
                  if (event.key === "Enter") {
                    setCurrentDate((currentValue) => {
                      const copiedCurrentValue = structuredClone(currentValue);

                      if (typeof value !== "string") {
                        copiedCurrentValue.setDate(value);
                      }

                      return copiedCurrentValue;
                    });
                  }
                }}>
                {value}
                {value !== "" && <ClickEffect></ClickEffect>}
              </div>
            );
          })}
        </div>
        <div className={`${styles.timer} ${isTimerOpen ? styles.open : ""}`}>
          <div className={`${styles.wrapper}`} tabIndex={1}>
            <div className={`${styles.transparentBackground} ${styles.up}`}></div>
            <div
              className={`${styles.hours}`}
              ref={hoursElementRef}
              onScroll={(event) => {
                const selectedHour = Math.floor((event.currentTarget.scrollTop / (event.currentTarget.scrollHeight - event.currentTarget.offsetHeight)) * 24);

                minutesTimeoutRef.current !== null && clearTimeout(minutesTimeoutRef.current);
                hoursTimeoutRef.current !== null && clearTimeout(hoursTimeoutRef.current);

                hoursTimeoutRef.current = setTimeout(() => {
                  setCurrentDate((currentValue) => {
                    const copiedCurrentValue = structuredClone(currentValue);

                    copiedCurrentValue.setHours(selectedHour);

                    return copiedCurrentValue;
                  });
                }, 100);
              }}>
              {(() => {
                const hours = [];

                for (let i = 0; i < 24; i++) {
                  hours.push(i.toLocaleString(locale, { minimumIntegerDigits: 2, useGrouping: false }));
                }

                return hours.map((value) => {
                  return <p key={value}>{value}</p>;
                });
              })()}
            </div>
            <div className={`${styles.transparentBackground} ${styles.down}`}></div>
          </div>
          <p className={`${styles.colon}`}>:</p>
          <div className={`${styles.wrapper}`} tabIndex={1}>
            <div className={`${styles.transparentBackground} ${styles.up}`}></div>
            <div
              className={`${styles.minutes}`}
              ref={minutesElementRef}
              onScroll={(event) => {
                const selectedMinute = Math.floor((event.currentTarget.scrollTop / (event.currentTarget.scrollHeight - event.currentTarget.offsetHeight)) * 60);

                minutesTimeoutRef.current !== null && clearTimeout(minutesTimeoutRef.current);
                hoursTimeoutRef.current !== null && clearTimeout(hoursTimeoutRef.current);

                minutesTimeoutRef.current = setTimeout(() => {
                  setCurrentDate((currentValue) => {
                    const copiedCurrentValue = structuredClone(currentValue);

                    copiedCurrentValue.setMinutes(selectedMinute);

                    return copiedCurrentValue;
                  });
                }, 100);
              }}>
              {(() => {
                const minutes = [];

                for (let i = 0; i < 60; i++) {
                  minutes.push(i.toLocaleString(locale, { minimumIntegerDigits: 2, useGrouping: false }));
                }

                return minutes.map((value) => {
                  return <p key={value}>{value}</p>;
                });
              })()}
            </div>
            <div className={`${styles.transparentBackground} ${styles.down}`}></div>
          </div>
        </div>
        {type !== "only-time" && (
          <button
            className={`${styles.time}`}
            onClick={() => {
              setIsTimerOpen((currentValue) => (currentValue === false ? true : false));
            }}>
            {isTimerOpen ? (
              <IconCalendar color={style ? style.fontColor : "white"}></IconCalendar>
            ) : (
              <IconClock color={style ? style.fontColor : "white"}></IconClock>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(DataPicker);
