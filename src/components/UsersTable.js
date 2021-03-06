import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import DataTable from 'react-data-table-component';
import '../App.css';

function UserTable() {

    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [invalidData, setInvalidData] = useState([]);

    const processData = dataString => {
        const dataStringLines = dataString.split(/\r\n|\n/);
        const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
        headers.unshift("ID");
        const headersCheckCase = headers.map(x => x.toUpperCase());

        const list = [];

        let _id = 1;
        for (let i = 1; i < dataStringLines.length; i++) {

            let row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
            row.unshift(_id)

            if (headersCheckCase && row.length === headersCheckCase.length) {
                const obj = {};

                for (let j = 0; j < headersCheckCase.length; j++) {
                    let d = row[j];

                    if (typeof d === 'string') {
                        d.trim()
                    };

                    if (d.length > 0) {
                        if (d[0] === '"')
                            d = d.substring(1, d.length - 1);
                        if (d[d.length - 1] === '"')
                            d = d.substring(d.length - 2, 1);
                    };

                    if (headersCheckCase[j]) {
                        obj[headersCheckCase[j]] = d;
                    };
                }

                if (Object.values(obj).filter(x => x).length > 0) {
                    _id++;
                    list.push(obj);
                }
            }
        }

        function validateEmail(email) {
            const pattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return pattern.test(String(email).toLowerCase());
        }

        const Email = row => {
            const checkEmail = validateEmail(row['EMAIL']);
            if (!checkEmail) {
                return (
                    <div style={{ backgroundColor: "#ff7b5a", width: "100%", height: "100%" }}>{row['EMAIL']}</div>
                )
            }
            else {
                return (
                    <div style={{ width: "100%", height: "100%" }}>{row['EMAIL']}</div>
                )
            }
        };

        const findDuplicate = (newArr, newArr1) => {
            var obj = {};
            newArr.map((newAr, index) => {
                obj[newAr] = obj[newAr] || [];
                obj[newAr].push(index + 1);
            });
            newArr1.map((newAr1, index) => {
                obj[newAr1] = obj[newAr1] || [];
                obj[newAr1].push(index + 1);
            });
            return obj;
        };

        const arrayEmails = list.map(x => x.EMAIL);
        const arrayPhone = list.map(x => x.PHONE);
        const resultRows = findDuplicate(arrayEmails, arrayPhone);

        const Duplicate = row => {
            const unicEmail = (row.EMAIL).toLowerCase();
            const unicPhone = (row.PHONE);
            for (let key in resultRows) {
                if ((unicEmail === key && resultRows[unicEmail].length === 1) || (unicPhone === key && resultRows[unicPhone].length === 1)) {
                    return (
                        null
                    )
                }
                else {
                    const allDuplElements = [];

                    resultRows[unicEmail].filter(x => {
                        if (x !== row.ID) {
                            return allDuplElements.push(x);
                        }
                        return null;
                    });
                    resultRows[unicPhone].filter(y => {
                        if (y !== row.ID) {
                            return allDuplElements.push(y);
                        }
                        return null;
                    });
                    return (
                        <div >{allDuplElements[0]}</div>
                    )
                };
            };
        };

        const Age = row => {
            const checkAge = row.AGE;
            if (checkAge < 21 || !Number(checkAge)) {
                return (
                    <div data-tag="allowRowEvents" style={{ backgroundColor: "#ff7b5a", width: "100%", height: "100%", textAlign: "center" }}>{checkAge}</div>
                )
            }
            else {
                return (
                    <div data-tag="allowRowEvents" style={{ width: "100%", height: "100%", textAlign: "center" }}>{checkAge}</div>
                )
            };
        };

        const Experience = row => {
            const experience = Number(row.EXPERIENCE);
            const age = Number(row.AGE);
            if (experience >= age && experience >= 0 && age > 0) {
                return (
                    <div style={{ backgroundColor: "#ff7b5a", width: "100%", height: "100%" }}>{experience}</div>
                )
            }
            else {
                return (
                    <div style={{ width: "100%", height: "100%" }}>{experience}</div>
                )
            };
        };

        const YearlyIncome = row => {
            const yearlyIncome = row['YEARLY INCOME'];

            if (Number(yearlyIncome) < 0 && (!Number(yearlyIncome) || yearlyIncome > 1e6)) {
                return (
                    <div style={{ backgroundColor: "#ff7b5a", width: "100%", height: "100%" }}>{Number(yearlyIncome).toFixed(2)}</div>
                )
            }
            else {
                return (
                    <div style={{ width: "100%", height: "100%" }}>{Number(yearlyIncome).toFixed(2)}</div>
                )
            };
        };

        const LicenseStates = row => {
            const licenseStates = row['LICENSE STATES'].split("|");

            if (licenseStates.length > 1) {
                const checkManyElem = licenseStates.map(x => x.split(",")[0]).join(", ");
                return (
                    <div style={{ width: "100%", height: "100%" }}>{checkManyElem}</div>
                )
            }
            else {
                const checkOneElem = licenseStates.join("|").split(",")[0]
                return (
                    <div style={{ width: "100%", height: "100%" }}>{checkOneElem}</div>
                )
            };
        };

        const formatDate = date => {
            let d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return { pattern1: [year, month, day].join("-"), pattern2: [month, day, year].join("/") };
        }

        const ExpirationDate = row => {
            const expirationDate = row['EXPIRATION DATE'];
            const parseDate = Date.parse(expirationDate);
            // YYYY-MM-DD або MM/DD/YYYY

            const patternValidDate1 = /^\d{4}-\d{2}-\d{2}$/;
            const patternValidDate2 = /^\d{2}\/\d{2}\/\d{4}$/;
            const checkDate = Date.parse(formatDate(Date.now()).pattern1) - parseDate;

            if (!patternValidDate1 || !patternValidDate2 || checkDate >= 0) {
                return <div style={{ backgroundColor: "#ff7b5a", width: "100%", height: "100%" }}>{expirationDate}</div>
            }
            return <div style={{ width: "100%", height: "100%" }}>{expirationDate}</div>
        };

        const Phone = row => {
            const phone = row['PHONE'];

            const patternPhone1 = /^\+1\d{10}$/;
            const patternPhone2 = /^1\d{10}$/;
            const patternPhone3 = /^\d{10}$/;

            if (patternPhone1.test(phone)) {
                return <div style={{ width: "100%", height: "100%" }}>{phone}</div>
            } else if (patternPhone2.test(phone)) {
                return <div style={{ width: "100%", height: "100%" }}>+{phone}</div>
            } else if (patternPhone3.test(phone)) {
                return <div style={{ width: "100%", height: "100%" }}>+1{phone}</div>
            }
            return <div style={{ backgroundColor: "#ff7b5a", width: "100%", height: "100%" }}>{phone}</div>
        };

        const HasChildren = row => {
            const hasChildren = row['HAS CHILDREN'].toLowerCase();
            if (hasChildren === 'true' || !!hasChildren === false) {
                return <div style={{ width: "100%", height: "100%" }}>{hasChildren}</div>
            }
            return <div style={{ backgroundColor: "#ff7b5a", width: "100%", height: "100%" }}>{hasChildren}</div>
        };

        const LicenseNumber = row => {
            const licenseNumber = row['LICENSE NUMBER'].toLowerCase();

            const patternCheckLicense = /^[a-zA-Z0-9]{6}$/;

            if (patternCheckLicense.test(licenseNumber)) {
                return <div >{licenseNumber}</div>
            }
            return <div style={{ backgroundColor: "#ff7b5a", width: "100%", height: "100%" }}>{licenseNumber}</div>
        };


        const columns = [
            {
                name: "ID",
                selector: "ID",
                sortable: true,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "Full Name",
                selector: "FULL NAME",
                sortable: true,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "Phone",
                selector: "PHONE",
                sortable: true,
                cell: row => <Phone {...row} />,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "Email",
                selector: "EMAIL",
                sortable: true,
                cell: row => <Email {...row} />,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "Age",
                selector: "AGE",
                sortable: true,
                cell: row => <Age {...row} />,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "Experience",
                selector: "EXPERIENCE",
                sortable: true,
                center: true,
                cell: row => <Experience {...row} />,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "Yearly Income",
                selector: "YEARLY INCOME",
                sortable: true,
                cell: row => <YearlyIncome {...row} />,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "Has children",
                selector: "HAS CHILDREN",
                sortable: true,
                cell: row => <HasChildren {...row} />,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "License states",
                selector: "LICENSE STATES",
                sortable: true,
                cell: row => <LicenseStates {...row} />,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "Expiration date",
                selector: "EXPIRATION DATE",
                sortable: true,
                cell: row => <ExpirationDate {...row} />,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "License number",
                selector: "LICENSE NUMBER",
                sortable: true,
                cell: row => <LicenseNumber {...row} />,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            },
            {
                name: "Duplicate with",
                selector: "DUPLICATE WITH",
                sortable: true,
                cell: row => <Duplicate {...row} />,
                style: { border: "1px solid rgb(0, 0, 0)", display: "block", padding: "0", margin: "0" }
            }
        ];

        const chekTable = list.map(item => {
            if (!!!item["FULL NAME"] || !!!item["PHONE"] || !!!item["EMAIL"]) {
                return false
            }
            return true
        })

        function isInvalidData(rowItem) {
            return !rowItem;
        }

        if (chekTable.some(isInvalidData)) {
            setInvalidData("File format is not correct!");
        } else {
            setData(list);
            setColumns(columns);
        }

    }

    const handleFileUpload = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary', raw: 'false' });
            const wsname = wb.SheetNames[0];

            const ws = wb.Sheets[wsname];

            const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
            processData(data);
        };
        reader.readAsBinaryString(file);
    }

    return (
        <div className="container">
            <p align="right" className='mt-5'>
                <input
                    className="inputfile"
                    type="file"
                    name="file"
                    id="file"
                    // accept=".csv"
                    onChange={handleFileUpload}
                />
                <label htmlFor="file">Import users</label>
            </p>
            <DataTable
                title="Users"
                dense={true}
                pagination
                columns={columns}
                data={data}
                style={{ border: "1px solid rgb(0, 0, 0)", textAlign: "center", padding: "0" }}
            />
            <p align="right" className='mt-5'>
                <input
                    className="inputfile"
                    type="file"
                    name="file"
                    id="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                />
                <label htmlFor="file">Import users</label>
                <div className="container" style={{ backgroundColor: "#ff7b5a", width: "50%" }}>
                    <h3 className="text-center">{invalidData}</h3>
                </div>
            </p>
        </div>
    );
}

export default UserTable;