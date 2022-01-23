class Converter {
  constructor() {
    this.jsonArea = document.getElementById("json-area");
    this.csvArea = document.getElementById("csv-area");
    this.openFileButton = document.getElementById("openFile-btn");
    this.fileSelector = document.getElementById("file-selector");
    this.saveFileButton = document.getElementById("saveFile-btn");
    this.convertButton = document.getElementById("convert-btn");
    this.clearButton = document.getElementById("clear-btn");

    this.configureSaveFileBtnClick();
    this.configureConvertBtnClick();
    this.configureClearBtnClick();
    this.configureOpenFileBtnClick();
    this.configureFileReader();
  }

  parseCSV(csv) {
    const data = csv
      .split("\n")
      .filter((elem) => elem.length > 0)
      .map((elem) => elem.replace(/"/g, "").split(","));

    return data;
  }

  CSVtoJSON(csv) {
    const parsedData = this.parseCSV(csv);
    const data = [];

    let header = parsedData.shift();

    for (let i = 0; i < parsedData.length; i++) {
      let obj = {};

      for (let j = 0; j < header.length; j++) {
        obj[header[j]] = parsedData[i][j];
      }

      data.push(obj);
    }

    const json = JSON.stringify(data, null, 2);

    return json;
  }

  getJSON() {
    const jsonData = this.jsonArea.value;

    return jsonData;
  }

  getCSV() {
    const csvData = this.csvArea.value;

    return csvData;
  }

  setJSON(json) {
    this.jsonArea.value = json;
  }

  resetFileSelector() {
    this.fileSelector.value = "";
  }

  resetJSONArea() {
    this.jsonArea.value = "";
    this.jsonArea.className = "";
  }

  resetCSVArea() {
    this.csvArea.value = "";
  }

  isValidJSON(json) {
    try {
      JSON.parse(json);

      return true;
    } catch (error) {
      this.invalidJSONMessage(error)
      return false;
    }
  }

  isValidCSV(csv) {
    const regex = new RegExp(
      /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/
    );

    if (!regex.test(csv)) {
      return true;
    } else {
      this.invalidCSVMessage();
      return false;
    }
  }

  invalidJSONMessage(error) {
    if (error.message.includes("Unexpected end of JSON input")) {
     alert("JSON is empty!");
    } else {
     alert(`Invalid JSON! \n\n${error.message}`);
    }
  }

  invalidCSVMessage() {
    this.jsonArea.className = "error";
    this.jsonArea.value = `Invalid CSV!`;
  }

  convert() {
    const csv = this.getCSV();

    if (this.isValidCSV(csv)) {
      const json = this.CSVtoJSON(csv);

      this.resetJSONArea();
      this.setJSON(json);
    }
  }

  clear() {
    this.resetCSVArea();
    this.resetJSONArea();
    this.resetFileSelector();
  }

  async writeFile(fileHandle, contents) {
    const writable = await fileHandle.createWritable();

    await writable.write(contents);
    await writable.close();
  }

  async saveFile() {
    const jsonFile = this.getJSON();

    if (this.isValidJSON(jsonFile)) {
      const blob = new Blob([jsonFile], { type: "application/json;charset=utf-8;" });

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, "download.json");
      } else {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: "download",
          types: [
            {
              accept: { "application/json": [".json"] },
            },
          ],
        });

        await this.writeFile(fileHandle, blob);
      }
    }
  }

  configureFileReader() {
    this.fileSelector.addEventListener("change", (event) => {
      const reader = new FileReader();
      const file = event.target.files[0];
      const blob = new Blob([file]);

      reader.addEventListener("load", (event) => {
        if (event.target.result !== "undefined") {
          this.csvArea.value = event.target.result;
        }
      });

      reader.readAsText(blob);
    });
  }

  configureConvertBtnClick() {
    this.convertButton.addEventListener("click", () => this.convert());
  }

  configureClearBtnClick() {
    this.clearButton.addEventListener("click", () => this.clear());
  }

  configureSaveFileBtnClick() {
    this.saveFileButton.addEventListener("click", () => this.saveFile());
  }

  configureOpenFileBtnClick() {
    this.openFileButton.addEventListener("click", () => {
      this.fileSelector.click();
    });
  }
}

export default Converter;
