const fileSystem = require("fs");

const readMempoolData = (filePath) => {
  const fileContent = fileSystem.readFileSync(filePath, "utf-8");
  const mempoolTransactions = {};
  const lines = fileContent.split("\n").map((item) => item.trim());

  lines.forEach((transactionLine) => {
    const [transactionId, feeValue, weightValue, parentIds] =
      transactionLine.split(",");

    mempoolTransactions[transactionId] = {
      fee: Number(feeValue),
      weight: Number(weightValue),
      parents: parentIds ? new Set(parentIds.split(",")) : null,
    };
  });

  return mempoolTransactions;
};

const findHighestFeeTransaction = (mempoolData, validTxSet) => {
  let highestFeeTransaction = null;

  for (const [transactionId, transactionDetails] of Object.entries(
    mempoolData
  )) {
    if (!validTxSet.has(transactionId)) {
      const areParentsValid = transactionDetails.parents
        ? [...transactionDetails.parents].every((parentId) =>
            validTxSet.has(parentId)
          )
        : true;
      if (
        areParentsValid &&
        (highestFeeTransaction === null ||
          transactionDetails.fee > mempoolData[highestFeeTransaction].fee)
      ) {
        highestFeeTransaction = transactionId;
      }
    }
  }

  return highestFeeTransaction;
};

const validateAndSortMempool = (filePath) => {
  const mempoolData = readMempoolData(filePath);

  const validTransactionSet = new Set();

  let sortedTransactionList = [];
  let nextHighestFeeTransaction = "";

  do {
    nextHighestFeeTransaction = findHighestFeeTransaction(
      mempoolData,
      validTransactionSet
    );
    if (nextHighestFeeTransaction) {
      validTransactionSet.add(nextHighestFeeTransaction);
      sortedTransactionList.push(nextHighestFeeTransaction);
    }
  } while (nextHighestFeeTransaction);
  sortedTransactionList = sortedTransactionList.filter(
    (transactionId) => mempoolData[transactionId].parents !== null
  );

  return sortedTransactionList;
};

function sortMempoolByFee(inputFilePath) {
  const sortedTransactionIds = validateAndSortMempool(inputFilePath);
  //const output = fileSystem.writeFileSync('./block_sample.txt', sortedTransactionIds.join('\n'))
  return sortedTransactionIds;
}

const inputFileName = "./mempool.csv";
console.log(sortMempoolByFee(inputFileName));
git