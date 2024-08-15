export const format_Date = (originalDateStr)=>{

    const date = new Date(originalDateStr);

    // Format the date as an ISO string
    return date.toISOString();
    

}