/**
 * Converts ISO string (2025-01-15T...) to "2025-01-15"
 */
// export const formatDate = (isoString: string | undefined) => {
//   if (!isoString) return '';

// 	const formattedDate = new Intl.DateTimeFormat('en-CA', {
// 		year: 'numeric',
// 		month: '2-digit',
// 		day: '2-digit',
// 		timeZone: 'UTC' // keep the date from shifting
// 		}).format(new Date(isoString))

// 	return formattedDate
// }

export const formatDate = (date: string | undefined) => {
	const dateForInput = date
  ? new Date(date).toISOString().split('T')[0] 
  : '';

	return dateForInput;
}