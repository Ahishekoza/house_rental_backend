export const format_Date = (originalDateStr) => {
  const date = new Date(originalDateStr);

  return date.toISOString();
};

export const days_difference = (startDate, endDate) => {
  const differenceInTime =
    new Date(endDate).getTime() - new Date(startDate).getTime();

  // Convert milliseconds to days
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);

  // Return the difference in days (you may want to round or floor it)
  return Math.floor(differenceInDays);
};
