const getTotalPage = (totalCnt, itemPerPage) => {
  return (totalCnt % itemPerPage == 0) ? totalCnt / itemPerPage : parseInt(totalCnt / itemPerPage) + 1;
}

module.exports = {
  getTotalPage,
}