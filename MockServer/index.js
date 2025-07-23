import express from 'express'
import { promises as fs } from 'fs';
import path from "path";



const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World')
})

const getGecoLog = async (procnumber, bank) => {
  const dirname = '\\\\a1uac3fs01\\Ficheiros\\GECO\\WS_LOG\\' + bank;
  let allResults = [];

  const dirnameDated = `${dirname}\\${procnumber.slice(0, 3)}\\${procnumber.slice(3, 6)}`;

  try {
    const files = await fs.readdir(dirnameDated);

    for (let i = 0; i < files.length; i++) {
      const fileName = files[i];
      const filePath = `${dirnameDated}\\${fileName}`;
      const stats = await fs.stat(filePath);
      const birthtime = stats.birthtime;

      allResults.push({
        date: birthtime,
        dir: dirnameDated,
        fileName: fileName
      });
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }

  return allResults;
};


app.get('/getGecoLog', async (req, res) => {
	var procnumber = req.query.procnumber
	var bank = req.query.bank

	try {
		const data = await getGecoLog(procnumber, bank);
		console.log(data);
		res.send(data);
	} catch (error) {
		console.error("Error handling request:", error);
		res.status(500).send("Error fetching GECO log");
	}
		
})

const getBalcLog = async (procnumber, bank) => {
  const dirname = '\\\\a1uac3fs01\\Ficheiros\\BALC\\WS_LOG_AbC\\' + bank;

  const dateFolder = await fs.readdir(dirname);
  dateFolder.sort().reverse();

  let allResults = [];

  await Promise.all(
    dateFolder.map(async (item) => {
      const folderPath = `${dirname}\\${item}`;
      const files = await fs.readdir(folderPath);

      for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        if (fileName.includes(procnumber)) {
          const filePath = `${folderPath}\\${fileName}`;
          const stats = await fs.stat(filePath);
          const birthtime = stats.birthtime;

          allResults.push({
            date: birthtime,
            dir: folderPath,
            fileName: fileName
          });
        }
      }
    })
  );

  return allResults;
};

app.get('/getBalcLog', async (req, res) => {
	var procnumber = req.query.procnumber
	var bank = req.query.bank

	try {
		const data = await getBalcLog(procnumber, bank);
		console.log(data);
		res.send(data);
	} catch (error) {
		console.error("Error fetching BALC log:", error);
		res.status(500).send("Error fetching BALC log");
	}
		
})

const getProcPair = async (fileName, fileloc, procnumber, bank) => {
	let allResults = [];
	let filter = "";
	let fileslocation = "";
	  // Determine the filter based on the file location
	  if (fileloc.includes("GECO")) {
		let count = fileName.split('_').length;
		var dirname = '\\\\a1uac3fs01\\Ficheiros\\GECO\\WS_LOG\\' + bank;
		fileslocation = dirname + "\\" + procnumber.slice(0, 3) + "\\" + procnumber.slice(3, 6);
		
		filter = fileName.split('_')[count - 3];
	  } else if (fileloc.includes("BALC")) {
		let filelocsplit = fileloc.split('\\')

		fileslocation = '\\\\a1uac3fs01\\Ficheiros\\BALC\\WS_LOG_AbC\\' + bank + '\\' + filelocsplit[filelocsplit.length-1]
		
		let count = fileName.split('_').length;
		filter = fileName.split('_')[count - 2];
		
	  } else {
		console.error("Unknown file location type.");
	  }
	  console.log(filter)
  try {
    // Read all files in the provided directory
	console.log(fileslocation)
    const files = await fs.readdir(fileslocation)

    // Loop through each file
    for (let i = 0; i < files.length; i++) {
      const fileName = files[i];

      // Check if the file name includes the extracted filter
      if (fileName.includes(filter)) {
		const content = await fs.readFile(`${fileslocation}/${fileName}`, {
          encoding: "utf8"
        });
        allResults.push({ fileName: fileName , xml : content });
      }
    }
  } catch (error) {
    console.error("Error reading files in directory:", error);
  }

  return allResults;
};

app.get('/getProcPair', async (req, res) => {
	var fileName = req.query.filename
	var fileloc = req.query.fileloc
	var procnumber = req.query.procnumber
	var bank = req.query.bank

	try {
		const data = await getProcPair(fileName, fileloc, procnumber, bank);
		console.log(data);
		res.send(data);
	} catch (error) {
		console.error("Error fetching Pair log:", error);
		res.status(500).send("Error fetching Pair log");
	}
		
})


console.log("Running on 3001")
app.listen(3001)