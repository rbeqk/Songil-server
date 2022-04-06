const isBlockedComment = (userIdx, blockUsers) => {
  return blockUsers.includes(userIdx) ? 'Y' : 'N';
}

module.exports = {
  isBlockedComment,
}