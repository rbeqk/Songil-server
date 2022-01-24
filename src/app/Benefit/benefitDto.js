class BenefitInfoDTO{
  constructor({
    benefitIdx,
    imageUrl,
    discountInfo,
    title,
    detailInfo,
    deadline
  })
  {
    this.benefitIdx = benefitIdx;
    this.imageUrl = imageUrl;
    this.discountInfo = discountInfo;
    this.title = title;
    this.detailInfo = detailInfo;
    this.deadline = deadline;
  }
}

module.exports = {
  BenefitInfoDTO,
}