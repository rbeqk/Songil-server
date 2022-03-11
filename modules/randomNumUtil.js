const getRandomNum = (basis) => {
  const hour = new Date().getHours();
  const randomNum = parseInt(hour / basis) + 1;
  return randomNum;
};

module.exports = {
  getRandomNum,
}