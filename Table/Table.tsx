'use client';

import {
  cloneElement,
  createContext,
  Dispatch,
  isValidElement,
  JSX,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './styles.module.scss';
import { Plus_Jakarta_Sans } from 'next/font/google';
import DataPicker from './DataPicker/DataPicker';

import { useSignals } from '@preact/signals-react/runtime';
import { signal } from '@preact/signals-react';

type TableRowData = { id: string; isSelected: boolean; isNew: boolean; isModified: boolean };
type Headers = { key: string; displayName: string }[];
type CellDataType = 'string' | 'number' | 'date' | 'relation' | 'null' | 'values' | 'boleanValues' | 'checkbox' | 'button';

export type { TableRowData, Headers };

const isUpdatingDataSignal = signal(false);

const SetDataContext = createContext<null | Dispatch<SetStateAction<TableRowData[]>>>(null);
const InitialDataContext = createContext<TableRowData[]>([]);
const SetResizingContext = createContext<Dispatch<
  SetStateAction<{
    mousePositionStart: {
      x: number;
      y: number;
    };
    column: number;
    initialCellWidth: number;
  } | null>
> | null>(null);
const SetSortingColumnContext = createContext<null | Dispatch<
  SetStateAction<{
    type: 'asc' | 'desc';
    column: number;
  }>
>>(null);
const SetInitialDataContext = createContext<null | Dispatch<SetStateAction<TableRowData[]>>>(null);

const PlusJakartaSansFont = Plus_Jakarta_Sans({ weight: ['400', '500'], subsets: ['latin'] });

const arrayIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4b5a68">
      <path d="M600-160v-80h120v-480H600v-80h200v640H600Zm-440 0v-640h200v80H240v480h120v80H160Z" />
    </svg>
  );
};

const checkIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
    </svg>
  );
};

const searchIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#4b5a68">
      <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
    </svg>
  );
};

const addIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4b5a68">
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  );
};

const trashIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4b5a68">
      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
    </svg>
  );
};

const saveIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4b5a68">
      <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" />
    </svg>
  );
};

const getCellDataType = (value: string | number | boolean | Date | any[] | null | JSX.Element | undefined): CellDataType => {
  if (`${value}` === 'false' || `${value}` === 'true') {
    return 'boleanValues';
  }

  if (`${value}` === 'null') {
    return 'null';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'string') {
    return 'string';
  }

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return 'date';
  }

  if (Array.isArray(value)) {
    return 'values';
  }

  if (isValidElement(value)) {
    if (value.type === 'button') {
      return 'button';
    } else {
      return 'relation';
    }
  }

  return 'string';
};

const formattDataToType = (value: string) => {
  if (value == 'null') {
    return null;
  } else if (value == 'false') {
    return false;
  } else if (value == 'true') {
    return true;
  } else {
    return `${value}`;
  }
};

interface CheckboxProps {
  onToggle: (value: boolean) => void;
  defaultValue: boolean;
}

const Checkbox = ({ onToggle, defaultValue = false }: CheckboxProps) => {
  const [isChecked, setIsChecked] = useState(defaultValue);

  useLayoutEffect(() => {
    setIsChecked(defaultValue);
  }, [defaultValue]);

  return (
    <div
      className={`${styles.checkbox} ${isChecked ? styles.checked : ''}`}
      onClick={() => {
        setIsChecked((currentValue) => (currentValue === false ? true : false));

        onToggle(isChecked === false ? true : false);
      }}
    >
      <div className={`${styles.icon}`}>{checkIcon()}</div>
    </div>
  );
};

interface ValuesPickerProps {
  children: any[];
  onSelect: (value: string) => void;
}

const ValuesPicker = ({ children, onSelect }: ValuesPickerProps) => {
  return (
    <div className={`${styles.valuesPicker}`}>
      {children.map((value) => {
        return (
          <p key={value} className={`${styles.value}`} onClick={() => onSelect(value)}>
            {`${value}`}
          </p>
        );
      })}
    </div>
  );
};

type CellProps = {
  key: string;
  values?: string[];
  onClick?: (rowData: any, columnKey: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  className?: string;
  children?: string | boolean | JSX.Element | string[];
  disabled?: boolean;
};

const Cell = ({ children }: CellProps) => {
  return children;
};

export { Cell };

type RowProps = { key: string; children: JSX.Element[] | JSX.Element; className?: string };

const Row = ({ children }: RowProps) => {
  return children;
};

export { Row };

interface LocalCellProps {
  children?: string | boolean | JSX.Element | string[];
  disabled?: boolean;
  className?: string;
  type?: 'basic' | 'header' | 'searcher';
  cellDataType?: CellDataType;
  objectProperty?: string;
  rowId?: string;
  column?: number;
  row?: number;
  values?: any[];
  onClick?: (rowData: any, columnKey: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  setRelationTableData?: Dispatch<
    SetStateAction<{
      objectProperty: string;
      initialSetting: Boolean;
      parentRow: number;
      parentRowId: string;
    } | null>
  >;
  onSearch?: (event: { value: string; objectProperty: string }) => void;
}

const LocalCell = ({
  children,
  disabled = false,
  type,
  objectProperty,
  rowId,
  cellDataType = 'string',
  column,
  row,
  values,
  className,
  onClick,
  setRelationTableData,
  onSearch,
}: LocalCellProps) => {
  useSignals();

  cellDataType = getCellDataType(children);

  if (cellDataType === 'boleanValues') {
    values = [false, true];
  }

  if (Array.isArray(children) && children.every((value) => typeof value === 'string')) {
    values = children;
  }

  if (cellDataType === 'boleanValues' && objectProperty === 'isSelected') {
    cellDataType = 'checkbox';
  }

  const setData = useContext(SetDataContext);
  const initialData = useContext(InitialDataContext);
  const setResizing = useContext(SetResizingContext);
  const setSortingColumn = useContext(SetSortingColumnContext);

  const contentElementRef = useRef<null | HTMLDivElement>(null);

  const [hasFocus, setHasFocus] = useState(false);

  const initialCellValueBeforeRef = useRef<string | boolean | undefined>(undefined);

  const initialCellValue = useMemo(() => {
    if (cellDataType !== 'relation' && cellDataType !== 'button' && initialData.length !== 0) {
      const rowData = initialData.find((data) => data.id === rowId);

      if (rowData) {
        if (
          initialCellValueBeforeRef.current === undefined ||
          (initialCellValueBeforeRef.current !== undefined && isUpdatingDataSignal.value === false)
        ) {
          initialCellValueBeforeRef.current = rowData[objectProperty as keyof typeof rowData];

          return rowData[objectProperty as keyof typeof rowData];
        } else {
          return initialCellValueBeforeRef.current;
        }
      } else {
        return initialCellValueBeforeRef.current;
      }
    } else {
      return initialCellValueBeforeRef.current;
    }
  }, [initialData]);

  return (
    <div
      className={`${styles.cell} ${className !== undefined ? className : ''}  ${
        initialCellValue !== undefined && `${initialCellValue}` !== `${children}` && type === 'basic' && cellDataType !== 'relation'
          ? styles.edited
          : ''
      } ${objectProperty === 'isSelected' ? styles.select : ''}`}
      data-row={`${row}`}
      data-column={`${column}`}
    >
      <div
        className={`${styles.content}`}
        contentEditable={
          type === 'header' ||
          cellDataType === 'relation' ||
          cellDataType === 'date' ||
          cellDataType === 'boleanValues' ||
          objectProperty === 'isSelected' ||
          values !== undefined ||
          disabled === true ||
          cellDataType === 'button'
            ? false
            : true
        }
        suppressContentEditableWarning={true}
        tabIndex={1}
        ref={contentElementRef}
        onClick={async (event) => {
          setHasFocus(true);

          if (disabled === false) {
            if (cellDataType === 'relation' && objectProperty && setRelationTableData && row !== undefined && rowId !== undefined) {
              setRelationTableData((currentValue) => {
                const copiedCurrentValue = currentValue === null ? null : { ...currentValue };

                if (copiedCurrentValue === null) {
                  return { objectProperty: objectProperty, initialSetting: true, parentRow: row, parentRowId: rowId };
                } else {
                  return null;
                }
              });
            }

            if (type === 'header' && setSortingColumn && column !== undefined) {
              setSortingColumn((currentValue) => {
                const copiedCurrentValue = { ...currentValue };

                copiedCurrentValue.type = copiedCurrentValue.type === 'asc' ? 'desc' : 'asc';
                copiedCurrentValue.column = column;

                return copiedCurrentValue;
              });
            }
          }

          if (onClick !== undefined && objectProperty !== undefined && setData !== null) {
            const rowData = await new Promise((resolve) => {
              setData((currentValue) => {
                resolve(structuredClone(currentValue.find((data) => data.id === rowId)));

                return currentValue;
              });
            });

            onClick(rowData, objectProperty, event);
          }
        }}
        onBlur={(event) => {
          setHasFocus(false);

          const thisElement = event.currentTarget as HTMLDivElement;

          thisElement.scrollLeft = 0;

          if (
            setData &&
            type === 'basic' &&
            cellDataType !== 'relation' &&
            cellDataType !== 'date' &&
            cellDataType !== 'boleanValues' &&
            cellDataType !== 'checkbox' &&
            objectProperty
          ) {
            const formattedNewData = formattDataToType(thisElement.innerText);

            setData((currentValue) => {
              const copiedCurrentValue = [...currentValue];

              const rowData = copiedCurrentValue.find((data) => data.id === rowId);

              if (rowData) {
                //@ts-expect-error this shouldnt give an error (otherwise the provided object property does not exist)
                rowData[objectProperty as keyof typeof rowData] = formattedNewData;
              }

              return copiedCurrentValue;
            });
          }
        }}
      >
        {(() => {
          if (cellDataType === 'relation') {
            return arrayIcon();
          } else if (cellDataType === 'button') {
            return cloneElement(children as JSX.Element, {
              className: `${styles.cellButton}`,
            });
          } else if (cellDataType === 'date') {
            return new Date(children as string).toLocaleDateString(undefined, {
              second: 'numeric',
              minute: 'numeric',
              hour: 'numeric',
              weekday: 'short',
              month: 'long',
              year: 'numeric',
              day: 'numeric',
            });
          } else if (cellDataType === 'checkbox' || objectProperty === 'isSelected') {
            return (
              <Checkbox
                defaultValue={type === 'header' ? false : (children as boolean)}
                onToggle={(value) => {
                  if (setData) {
                    if (type === 'header') {
                      setData((currentValue) => {
                        const copiedCurrentValue = [...currentValue];

                        copiedCurrentValue.forEach((data) => {
                          data.isSelected = value;
                        });

                        return copiedCurrentValue;
                      });
                    } else {
                      setData((currentValue) => {
                        const copiedCurrentValue = [...currentValue];

                        const rowData = copiedCurrentValue.find((data) => data.id === rowId);

                        if (rowData) {
                          rowData.isSelected = value;
                        }

                        return copiedCurrentValue;
                      });
                    }
                  }
                }}
              ></Checkbox>
            );
          } else if (type === 'searcher') {
            return (
              <input
                placeholder="Search"
                onInput={(event) => {
                  const thisElement = event.currentTarget as HTMLInputElement;

                  if (onSearch && objectProperty) {
                    onSearch({ objectProperty: objectProperty, value: thisElement.value });
                  }
                }}
              ></input>
            );
          } else {
            return `${children}`;
          }
        })()}
      </div>
      {disabled === false && hasFocus && document.activeElement === contentElementRef.current && type === 'basic' && cellDataType === 'date' && (
        <div
          className={`${styles.pickerWrapper}`}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <DataPicker
            type={'date-time'}
            initialDate={new Date(children as string)}
            style={{
              backgrondColor: 'white',
              fontColor: '#4b5a68',
              hoverColor: '#ecf1f8',
              borderColor: 'transparent',
              componentBorderRadius: '0px',
            }}
            onSave={(value) => {
              if (setData && objectProperty && disabled === false) {
                setData((currentValue) => {
                  const copiedCurrentValue = [...currentValue];

                  const rowData = copiedCurrentValue.find((data) => data.id === rowId);

                  if (rowData) {
                    //@ts-expect-error this shouldnt give an error (otherwise the provided object property does not exist)
                    rowData[objectProperty as keyof typeof rowData] = value.toISOString();
                  }

                  return copiedCurrentValue;
                });
              }
            }}
          ></DataPicker>
        </div>
      )}
      {disabled === false &&
        hasFocus &&
        document.activeElement === contentElementRef.current &&
        values !== undefined &&
        cellDataType !== 'checkbox' && (
          <div
            className={`${styles.pickerWrapper}`}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <ValuesPicker
              onSelect={(value) => {
                if (setData && disabled === false) {
                  const formattedNewData = formattDataToType(value);

                  setData((currentValue) => {
                    const copiedCurrentValue = [...currentValue];

                    const rowData = copiedCurrentValue.find((data) => data.id === rowId);

                    if (rowData) {
                      //@ts-expect-error this shouldnt give an error (otherwise the provided object property does not exist)
                      rowData[objectProperty as keyof typeof rowData] = formattedNewData;
                    }

                    return copiedCurrentValue;
                  });
                }
              }}
            >
              {values!}
            </ValuesPicker>
          </div>
        )}
      {type === 'header' && (
        <div
          className={`${styles.resizing}`}
          onMouseDown={(event) => {
            if (setResizing && objectProperty && column !== undefined) {
              window.document.documentElement.style.userSelect = 'none';

              setResizing({
                initialCellWidth: ((event.currentTarget as HTMLDivElement).parentElement as HTMLDivElement).getBoundingClientRect().width,
                column: column,
                mousePositionStart: {
                  x: event.clientX,
                  y: event.clientY,
                },
              });
            }
          }}
        ></div>
      )}
    </div>
  );
};

interface LocalRowProps {
  children: JSX.Element[];
  type?: 'basic' | 'header' | 'searcher';
  id?: string;
  headers?: Headers;
  row?: number;
  tableElement?: HTMLDivElement | null;
  className?: string;
}

const LocalRow = ({ children, type = 'basic', id, headers, row, tableElement, className }: LocalRowProps) => {
  useSignals();

  const initialData = useContext(InitialDataContext);
  const initialSetData = useContext(SetDataContext);

  const [relationTableData, setRelationTableData] = useState<null | {
    objectProperty: string;
    initialSetting: Boolean;
    parentRow: number;
    parentRowId: string;
  }>(null);
  const [data, setData] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const observerRef = useRef<null | IntersectionObserver>(null);
  const rowWrapperElementRef = useRef<null | HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (initialSetData && relationTableData) {
      if (relationTableData.initialSetting === false) {
        initialSetData((currentValue) => {
          const copiedCurrentValue = [...currentValue];

          const rowData = copiedCurrentValue.find((data) => data.id === id);

          if (rowData) {
            const copiedData = structuredClone(data);

            (rowData[relationTableData.objectProperty as keyof typeof rowData] as unknown as any[]) = copiedData;
          }

          return copiedCurrentValue;
        });
      } else {
        setRelationTableData((currentValue) => {
          const copiedCurrentValue = currentValue ? { ...currentValue } : null;

          if (copiedCurrentValue) {
            copiedCurrentValue.initialSetting = false;
          }

          return copiedCurrentValue;
        });
      }
    }
  }, [data, initialSetData]);

  useLayoutEffect(() => {
    if (relationTableData && relationTableData.initialSetting === true && initialSetData) {
      const rowData = initialData.find((data) => data.id === id)!;

      const cellValue = rowData[relationTableData.objectProperty as keyof typeof rowData] as unknown as any[];

      setData(structuredClone(cellValue));

      (async () => {
        const initialData = await new Promise<TableRowData[]>((resolve) => {
          initialSetData((currentValue) => {
            setTimeout(() => {
              resolve(structuredClone(currentValue));
            }, 1);

            return currentValue;
          });
        });

        const rowData = initialData.find((data) => data.id === id)!;

        const cellValue = rowData[relationTableData.objectProperty as keyof typeof rowData] as unknown as any[];

        setData(structuredClone(cellValue));
      })();
    }

    if (tableElement !== null && tableElement !== undefined) {
      tableElement.scrollLeft = 0;
    }
  }, [relationTableData]);

  useEffect(() => {
    if (observerRef.current === null && rowWrapperElementRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(({ isIntersecting }) => {
            if (type === 'basic') {
              setIsVisible(isIntersecting);
            }

            if (isIntersecting === false) {
              setRelationTableData(null);
            }
          });
        },
        {
          rootMargin: '500px 5000px 500px 5000px',
          threshold: 0,
        }
      );

      observerRef.current.observe(rowWrapperElementRef.current);

      return () => {
        observerRef.current!.disconnect();
        observerRef.current = null;
      };
    }
  }, []);

  useLayoutEffect(() => {
    if (isVisible && rowWrapperElementRef.current && headers && tableElement) {
      const headerRowCellElements = [...tableElement.querySelectorAll(`[data-row="-1"]`)] as HTMLDivElement[];
      const currentRowCellElements = [...(rowWrapperElementRef.current.firstChild as HTMLDivElement).children] as HTMLDivElement[];

      currentRowCellElements.forEach((element, index) => {
        element.style.width = headerRowCellElements[index]?.style.width;
      });
    }
  }, [isVisible]);

  const relationTableReactElement = relationTableData
    ? (
        children.find((child) => (child as ReactElement).key === `${relationTableData.objectProperty}`) as
          | ReactElement<{
              children: JSX.Element;
            }>
          | undefined
      )?.props.children
    : undefined;

  const sortedChildrenByHeaders = (() => {
    const sortedChildren: ReactElement[] = [];

    headers!.forEach((data) => {
      const foundChild = children.find((child) => (child as ReactElement).key === `${data.key}`);

      if (foundChild) {
        sortedChildren.push(foundChild as ReactElement);
      }
    });

    return sortedChildren;
  })() as ReactElement<CellProps>[];

  const isRowSelected = children.find((child) => child.key === 'isSelected')?.props.children;
  const isRowNew = children.find((child) => child.key === 'isNew')?.props.children;

  useEffect(() => {
    if (initialSetData && isUpdatingDataSignal.value === false) {
      initialSetData((currentValue) => {
        const copiedCurrentValue = [...currentValue];

        const initialRowData = initialData.find((data) => data.id === id);

        if (initialRowData) {
          const row = copiedCurrentValue.find((data) => data.id === id);

          const isRowModified = Object.entries(initialRowData).some(([key, value]) => {
            if (key !== 'isModified' && row !== undefined) {
              //@ts-ignore
              return `${row[key]}` !== `${value}`;
            } else {
              return false;
            }
          });

          if (row && row.isModified !== isRowModified) {
            row.isModified = isRowModified;

            return copiedCurrentValue;
          } else {
            return currentValue;
          }
        } else {
          return currentValue;
        }
      });
    }
  });

  return (
    <div
      className={`${styles.rowWrapper} ${className !== undefined ? className : ''} ${type === 'header' ? styles.header : ''} ${
        type === 'searcher' ? styles.searcher : ''
      } ${(isRowSelected || isRowNew) && type !== 'header' ? styles.selected : ''}`}
      ref={rowWrapperElementRef}
    >
      <div className={`${styles.row}`}>
        {isVisible &&
          sortedChildrenByHeaders.map((child, index) => {
            return (
              <LocalCell
                key={child.key}
                className={child.props.className}
                type={type}
                rowId={id}
                objectProperty={child.key!}
                setRelationTableData={setRelationTableData}
                row={row}
                column={index}
                values={child.props.values}
                disabled={child.props.disabled}
                onClick={child.props.onClick}
              >
                {child.props.children}
              </LocalCell>
            );
          })}
      </div>
      {relationTableReactElement &&
        cloneElement(relationTableReactElement, { relationSetData: setData, initialData: initialData, relationTableData: relationTableData })}
    </div>
  );
};

interface TableProps<Data> {
  children: JSX.Element[];
  headers: Headers;
  initialData?: any[];
  relationTableData?: null | { objectProperty: string; initialSetting: Boolean; parentRow: number; parentRowId?: string };
  emptyText?: string;
  setData: Dispatch<SetStateAction<(Data & TableRowData)[]>>;
  relationSetData?: Dispatch<SetStateAction<(Data & TableRowData)[]>>;
  onSearch?: (event: { value: string; objectProperty: string }) => void;
  onSave?: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
}

const Table = <Data,>({
  children,
  headers,
  initialData: initialDataBefore,
  relationTableData,
  emptyText = 'Brak danych',
  setData,
  relationSetData,
  onSearch,
  onSave,
  onAdd,
  onDelete,
}: TableProps<Data>) => {
  useSignals();

  if (relationSetData) {
    setData = relationSetData;
  }

  const SetInitialDataFromContext = useContext(SetInitialDataContext);
  const setDataFormPreviousTable = useContext(SetDataContext);

  const [loading, setLoading] = useState({ skippingFirstSorting: true, settingCellsWidth: true, settingInitialData: true });
  const [initialData, setInitialData] = useState<TableRowData[]>(initialDataBefore ? initialDataBefore : []);
  const [resizing, setResizing] = useState<null | {
    mousePositionStart: {
      x: number;
      y: number;
    };
    column: number;
    initialCellWidth: number;
  }>(null);
  const [sorting, setSorting] = useState<{
    type: 'asc' | 'desc';
    column: number;
  }>({ column: 0, type: 'asc' });
  const [isSearcherOpen, setIsSearcherOpen] = useState(false);

  const tableElementRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (relationTableData !== null && relationTableData !== undefined && setDataFormPreviousTable !== null && SetInitialDataFromContext !== null) {
      isUpdatingDataSignal.value = true;

      (async () => {
        const newData = await new Promise<any[]>((resolve) => {
          setDataFormPreviousTable((currentValue) => {
            const copiedCurrentValue = [...currentValue];

            const foundData = copiedCurrentValue.find((data, index) => data.id === relationTableData!.parentRowId);

            if (foundData) {
              //@ts-ignore
              resolve(structuredClone(foundData[relationTableData.objectProperty]));
            } else {
              //@ts-ignore
              resolve(null);
            }

            return currentValue;
          });
        });

        const newData1 = await new Promise<any[]>((resolve) => {
          setDataFormPreviousTable((currentValue) => {
            const copiedCurrentValue = [...currentValue];

            //@ts-ignore
            resolve(structuredClone(copiedCurrentValue));

            return currentValue;
          });
        });

        if (initialData.length < newData.length) {
          setData(newData);

          setInitialData(structuredClone(newData));
          SetInitialDataFromContext(structuredClone(newData1));
        }

        setTimeout(() => {
          isUpdatingDataSignal.value = false;
        }, 5);
      })();
    } else {
      isUpdatingDataSignal.value = true;

      (async () => {
        const newData = await new Promise<any[]>((resolve) => {
          setData((currentValue) => {
            resolve(structuredClone(currentValue));

            return currentValue;
          });
        });

        setInitialData(structuredClone(newData));

        setTimeout(() => {
          isUpdatingDataSignal.value = false;
        }, 5);
      })();
    }
  }, [children.length]);

  useEffect(() => {
    const headerObjectProperty = headers.find((data, index) => index === sorting.column)?.key;

    if (headerObjectProperty && loading.skippingFirstSorting === false) {
      setData((currentValue) => {
        const copiedCurrentValue = [...currentValue];

        copiedCurrentValue.sort((a, b) =>
          a[headerObjectProperty as keyof typeof a] > b[headerObjectProperty as keyof typeof b]
            ? sorting.type === 'asc'
              ? 1
              : -1
            : b[headerObjectProperty as keyof typeof b] > a[headerObjectProperty as keyof typeof a]
            ? sorting.type === 'desc'
              ? 1
              : -1
            : 0
        );

        return copiedCurrentValue;
      });
    }

    setLoading((currentValue) => {
      const copiedCurrentValue = { ...currentValue };

      copiedCurrentValue.skippingFirstSorting = false;

      return copiedCurrentValue;
    });
  }, [sorting]);

  useEffect(() => {
    if (tableElementRef.current && resizing !== null) {
      const { column, mousePositionStart, initialCellWidth } = resizing;

      const cellElements = tableElementRef.current.querySelectorAll(
        `:scope > .${styles.rowWrapper} > .${styles.row} > .${styles.cell}:is([data-column="${column}"])`
      ) as unknown as HTMLDivElement[];

      const mousemove = (event: MouseEvent) => {
        cellElements.forEach((element) => {
          element.style.width = `${Math.round(initialCellWidth + (event.clientX - mousePositionStart.x))}px`;
        });
      };

      window.addEventListener('mousemove', mousemove);

      const mouseup = (event: MouseEvent) => {
        window.document.documentElement.style.userSelect = 'none';

        setResizing(null);
      };

      window.addEventListener('mouseup', mouseup);

      return () => {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mousemove', mouseup);
      };
    }
  }, [resizing]);

  useEffect(() => {
    (async () => {
      const initialData = await new Promise<TableRowData[]>((resolve) => {
        setData((currentValue) => {
          resolve(structuredClone(currentValue));

          return currentValue;
        });
      });

      setInitialData(structuredClone(initialData));

      setLoading((currentValue) => {
        const copiedCurrentValue = { ...currentValue };

        copiedCurrentValue.settingInitialData = false;

        return copiedCurrentValue;
      });

      const missingTypes: string[] = [];

      initialData.forEach((data) => {
        if (data.hasOwnProperty('id') === false) {
          if (missingTypes.find((value) => value === 'id') === undefined) {
            missingTypes.push('id');
          }
        }

        if (data.hasOwnProperty('isSelected') === false) {
          if (missingTypes.find((value) => value === 'isSelected') === undefined) {
            missingTypes.push('isSelected');
          }
        }

        if (data.hasOwnProperty('isNew') === false) {
          if (missingTypes.find((value) => value === 'isNew') === undefined) {
            missingTypes.push('isNew');
          }
        }

        if (data.hasOwnProperty('isModified') === false) {
          if (missingTypes.find((value) => value === 'isModified') === undefined) {
            missingTypes.push('isModified');
          }
        }
      });

      if (missingTypes.length !== 0) {
        throw new Error(
          `Given data has invalid structure. Make sure if every object has "id", "isSelected", "isNew", "isModified". You can import "TableRowData" type to ensure types. Missing types: ${missingTypes
            .map((value) => `"${value}"`)
            .join(', ')}.`
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (tableElementRef.current) {
      const cellElements = tableElementRef.current.querySelectorAll(
        `:scope > .${styles.rowWrapper} > .${styles.row} > .${styles.cell}`
      ) as unknown as HTMLDivElement[];
      const { width } = tableElementRef.current.getBoundingClientRect();
      const tableElementWidthWithoutScrollBar = width - (16 + 2); // 16 is scroll bar width from css
      const hasHeaderSelectCell = headers.some((data) => data.key === 'isSelected');

      cellElements.forEach((element) => {
        if (hasHeaderSelectCell) {
          const width = tableElementWidthWithoutScrollBar / (headers.length - 1) - 40 / (headers.length - 1);

          element.style.width = `${Math.max(100, width)}px`; // 40 is select cell max width (row height)
        } else {
          const width = tableElementWidthWithoutScrollBar / headers.length;
          element.style.width = `${Math.max(100, width)}px`;
        }
      });

      setLoading((currentValue) => {
        const copiedCurrentValue = { ...currentValue };

        copiedCurrentValue.settingCellsWidth = false;

        return copiedCurrentValue;
      });
    }
  }, []);

  return (
    <SetInitialDataContext.Provider value={setInitialData}>
      <SetSortingColumnContext.Provider value={setSorting}>
        <SetResizingContext.Provider value={setResizing}>
          <InitialDataContext.Provider value={initialData}>
            <SetDataContext.Provider value={setData as Dispatch<SetStateAction<TableRowData[]>>}>
              <div
                className={`${styles.tableWrapper} ${Object.values(loading).some((value) => value === true) ? styles.loading : ''} ${
                  isSearcherOpen ? styles.searcherOpen : ''
                }`}
              >
                <div className={`${styles.table} ${PlusJakartaSansFont.className}`} ref={tableElementRef}>
                  <LocalRow type="header" headers={headers} row={-2} tableElement={tableElementRef.current}>
                    {headers.map(({ key, displayName }, index) => {
                      return (
                        <LocalCell key={key} column={index}>
                          {displayName}
                        </LocalCell>
                      );
                    })}
                  </LocalRow>
                  <LocalRow type="searcher" headers={headers} row={-1} tableElement={tableElementRef.current}>
                    {headers.map(({ key }, index) => {
                      return (
                        <LocalCell
                          key={key}
                          column={index}
                          onSearch={(event) => {
                            if (onSearch) {
                              onSearch(event);
                            }
                          }}
                        ></LocalCell>
                      );
                    })}
                  </LocalRow>
                  {children.map((child, index) => {
                    return (
                      <LocalRow
                        key={child.key}
                        className={child.props.className}
                        id={child.key!}
                        headers={headers}
                        row={index}
                        tableElement={tableElementRef.current}
                      >
                        {child.props.children}
                      </LocalRow>
                    );
                  })}
                </div>
                <div className={`${styles.menu}`}>
                  <button
                    className={`saveDataToTableButton ${SetInitialDataFromContext !== null ? styles.hidden : ''}`}
                    onClick={async () => {
                      if (onSave) {
                        onSave();
                      }

                      // const allSaveButtons = [...tableElementRef.current!.querySelectorAll(`.saveDataToTableButton`)] as HTMLButtonElement[];

                      // allSaveButtons.forEach((element) => element.click());

                      // const initialData = await new Promise<TableRowData[]>((resolve) => {
                      //   setData((currentValue) => {
                      //     const copiedCurrentValue = [...currentValue];

                      //     copiedCurrentValue.forEach((data) => {
                      //       data.isNew = false;
                      //       data.isModified = false;
                      //     });

                      //     resolve(copiedCurrentValue);

                      //     return copiedCurrentValue;
                      //   });
                      // });

                      // setInitialData(structuredClone(initialData));
                    }}
                  >
                    {saveIcon()}
                  </button>

                  {onSearch && (
                    <button
                      onClick={() => {
                        setIsSearcherOpen((currentValue) => (currentValue === false ? true : false));
                      }}
                    >
                      {searchIcon()}
                    </button>
                  )}
                  {onAdd && (
                    <button
                      onClick={() => {
                        if (onAdd) {
                          onAdd();
                        }
                      }}
                    >
                      {addIcon()}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (onDelete) {
                          onDelete();
                        }
                      }}
                    >
                      {trashIcon()}
                    </button>
                  )}
                </div>
                {children.length === 0 && <p className={`${styles.emptyText}`}>{emptyText}</p>}
              </div>
            </SetDataContext.Provider>
          </InitialDataContext.Provider>
        </SetResizingContext.Provider>
      </SetSortingColumnContext.Provider>
    </SetInitialDataContext.Provider>
  );
};

export { Table };
