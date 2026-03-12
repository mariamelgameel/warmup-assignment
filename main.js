const fs = require("fs");
//final check
// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    let sParts = startTime.trim().toLowerCase().split(" ");
    let eParts = endTime.trim().toLowerCase().split(" ");

    let sTime = sParts[0].split(":");
    let eTime = eParts[0].split(":");

    let sh = Number(sTime[0]);
    let sm = Number(sTime[1]);
    let ss = Number(sTime[2]);

    let eh = Number(eTime[0]);
    let em = Number(eTime[1]);
    let es = Number(eTime[2]);

    if (sParts[1] == "pm" && sh != 12) {
        sh += 12;
    }
    if (sParts[1] == "am" && sh == 12) {
        sh = 0;
    }

    if (eParts[1] == "pm" && eh != 12) {
        eh += 12;
    }
    if (eParts[1] == "am" && eh == 12) {
        eh = 0;
    }

    let startSeconds = sh * 3600 + sm * 60 + ss;
    let endSeconds = eh * 3600 + em * 60 + es;

    let diff;
    if (endSeconds >= startSeconds) {
        diff = endSeconds - startSeconds;
    } else {
        diff = (24 * 3600 - startSeconds) + endSeconds;
    }

    let h = Math.floor(diff / 3600);
    let m = Math.floor((diff % 3600) / 60);
    let s = diff % 60;

    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }

    return h + ":" + m + ":" + s;
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    let sParts = startTime.trim().toLowerCase().split(" ");
    let eParts = endTime.trim().toLowerCase().split(" ");

    let sTime = sParts[0].split(":");
    let eTime = eParts[0].split(":");

    let sh = Number(sTime[0]);
    let sm = Number(sTime[1]);
    let ss = Number(sTime[2]);

    let eh = Number(eTime[0]);
    let em = Number(eTime[1]);
    let es = Number(eTime[2]);

    if (sParts[1] == "pm" && sh != 12) {
        sh += 12;
    }
    if (sParts[1] == "am" && sh == 12) {
        sh = 0;
    }

    if (eParts[1] == "pm" && eh != 12) {
        eh += 12;
    }
    if (eParts[1] == "am" && eh == 12) {
        eh = 0;
    }

    let startSeconds = sh * 3600 + sm * 60 + ss;
    let endSeconds = eh * 3600 + em * 60 + es;

    if (endSeconds < startSeconds) {
        endSeconds += 24 * 3600;
    }

    let workStart = 8 * 3600;
    let workEnd = 22 * 3600;

    let idle = 0;

    if (startSeconds < workStart) {
        if (endSeconds <= workStart) {
            idle += endSeconds - startSeconds;
        } else {
            idle += workStart - startSeconds;
        }
    }

    if (endSeconds > workEnd) {
        if (startSeconds >= workEnd) {
            idle += endSeconds - startSeconds;
        } else {
            idle += endSeconds - workEnd;
        }
    }

    let h = Math.floor(idle / 3600);
    let m = Math.floor((idle % 3600) / 60);
    let s = idle % 60;

    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }

    return h + ":" + m + ":" + s;
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    let shift = shiftDuration.split(":");
    let idle = idleTime.split(":");

    let shiftSeconds = Number(shift[0]) * 3600 + Number(shift[1]) * 60 + Number(shift[2]);
    let idleSeconds = Number(idle[0]) * 3600 + Number(idle[1]) * 60 + Number(idle[2]);

    let activeSeconds = shiftSeconds - idleSeconds;

    let h = Math.floor(activeSeconds / 3600);
    let m = Math.floor((activeSeconds % 3600) / 60);
    let s = activeSeconds % 60;

    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }

    return h + ":" + m + ":" + s;
}


// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    let parts = activeTime.split(":");
    let activeSeconds = Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);

    let neededSeconds;

    if (date >= "2025-04-10" && date <= "2025-04-30") {
        neededSeconds = 6 * 3600;
    } else {
        neededSeconds = 8 * 3600 + 24 * 60;
    }

    return activeSeconds >= neededSeconds;
}
// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    let fs = require("fs");
    let content = fs.readFileSync(textFile, "utf8").trim();
    let lines = [];

    if (content != "") {
        lines = content.split("\n");
    }

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts[0].trim() == shiftObj.driverID.trim() && parts[2].trim() == shiftObj.date.trim()) {
            return {};
        }
    }

    let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let quota = metQuota(shiftObj.date, activeTime);

    let newLine = shiftObj.driverID + "," +
                  shiftObj.driverName + "," +
                  shiftObj.date + "," +
                  shiftObj.startTime + "," +
                  shiftObj.endTime + "," +
                  shiftDuration + "," +
                  idleTime + "," +
                  activeTime + "," +
                  quota + ",false";

    let lastIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts[0].trim() == shiftObj.driverID.trim()) {
            lastIndex = i;
        }
    }

    if (lastIndex == -1) {
        lines.push(newLine);
    } else {
        lines.splice(lastIndex + 1, 0, newLine);
    }

    fs.writeFileSync(textFile, lines.join("\n"));

    return {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: quota,
        hasBonus: false
    };
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    let fs = require("fs");
    let lines = fs.readFileSync(textFile, "utf8").trim().split("\n");

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts[0].trim() == driverID.trim() && parts[2].trim() == date.trim()) {
            parts[9] = String(newValue);
            lines[i] = parts.join(",");
            break;
        }
    }

    fs.writeFileSync(textFile, lines.join("\n"));
}



// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    let fs = require("fs");
    let lines = fs.readFileSync(textFile, "utf8").trim().split("\n");

    let found = false;
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        let id = parts[0].trim();
        let date = parts[2].trim();
        let bonus = parts[9].trim();

        if (id == driverID.trim()) {
            found = true;

            let m = Number(date.split("-")[1]);
            if (m == Number(month) && bonus == "true") {
                count++;
            }
        }
    }

    if (found == false) {
        return -1;
    }

    return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    let fs = require("fs");
    let lines = fs.readFileSync(textFile, "utf8").trim().split("\n");

    let totalSeconds = 0;

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");

        if (parts[0].trim() == driverID.trim()) {
            let m = Number(parts[2].trim().split("-")[1]);

            if (m == Number(month)) {
                let timeParts = parts[7].trim().split(":");
                totalSeconds += Number(timeParts[0]) * 3600 + Number(timeParts[1]) * 60 + Number(timeParts[2]);
            }
        }
    }

    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;

    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }

    return h + ":" + m + ":" + s;
}
// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    let fs = require("fs");

    let shiftLines = fs.readFileSync(textFile, "utf8").trim().split("\n");
    let rateLines = fs.readFileSync(rateFile, "utf8").trim().split("\n");

    let dayOff = "";

    for (let i = 0; i < rateLines.length; i++) {
        let parts = rateLines[i].split(",");
        if (parts[0].trim() == driverID.trim()) {
            dayOff = parts[1].trim();
            break;
        }
    }

    let totalSeconds = 0;

    for (let i = 0; i < shiftLines.length; i++) {
        let parts = shiftLines[i].split(",");

        if (parts[0].trim() == driverID.trim()) {
            let date = parts[2].trim();
            let m = Number(date.split("-")[1]);

            if (m == Number(month)) {
                let d = new Date(date);
                let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                let currentDay = days[d.getDay()];

                if (currentDay != dayOff) {
                    if (date >= "2025-04-10" && date <= "2025-04-30") {
                        totalSeconds += 6 * 3600;
                    } else {
                        totalSeconds += 8 * 3600 + 24 * 60;
                    }
                }
            }
        }
    }

    totalSeconds -= bonusCount * 2 * 3600;

    if (totalSeconds < 0) {
        totalSeconds = 0;
    }

    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;

    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }

    return h + ":" + m + ":" + s;
}


// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    let fs = require("fs");
    let lines = fs.readFileSync(rateFile, "utf8").trim().split("\n");

    let basePay = 0;
    let tier = 0;

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts[0].trim() == driverID.trim()) {
            basePay = Number(parts[2]);
            tier = Number(parts[3]);
            break;
        }
    }

    let actualParts = actualHours.split(":");
    let requiredParts = requiredHours.split(":");

    let actualSeconds = Number(actualParts[0]) * 3600 + Number(actualParts[1]) * 60 + Number(actualParts[2]);
    let requiredSeconds = Number(requiredParts[0]) * 3600 + Number(requiredParts[1]) * 60 + Number(requiredParts[2]);

    if (actualSeconds >= requiredSeconds) {
        return basePay;
    }

    let missingSeconds = requiredSeconds - actualSeconds;

    let allowedHours = 0;
    if (tier == 1) {
        allowedHours = 50;
    } else if (tier == 2) {
        allowedHours = 20;
    } else if (tier == 3) {
        allowedHours = 10;
    } else if (tier == 4) {
        allowedHours = 3;
    }

    let allowedSeconds = allowedHours * 3600;
    let deductedSeconds = missingSeconds - allowedSeconds;

    if (deductedSeconds <= 0) {
        return basePay;
    }

    let deductedHours = Math.floor(deductedSeconds / 3600);
    let oneHourDeduction = Math.floor(basePay / 185);

    return basePay - deductedHours * oneHourDeduction;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
