const escapeHTML = (value: string): string => {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
};

const worksheetName = (value: string): string => {
	const normalized = value.replace(/[\\/:*?\[\]]/g, " ").trim();
	return (normalized || "Report").slice(0, 31);
};

const reportTableHTML = (element: HTMLElement): string => {
	const clone = element.cloneNode(true) as HTMLElement;
	clone.querySelectorAll("[data-report-exclude]").forEach((item) => {
		item.remove();
	});

	return Array.from(clone.querySelectorAll("table"))
		.map((table) => table.outerHTML)
		.join("<br>");
};

export const exportReportTablesToExcel = (
	element: HTMLElement,
	sheetName: string,
	fileName: string,
): void => {
	const tableHTML = reportTableHTML(element);
	if (!tableHTML) {
		return;
	}

	const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
	<head>
		<meta charset="UTF-8">
		<style>
			table { border-collapse: collapse; }
			th, td { border: 1px solid #808080; padding: 4px 8px; }
			th { background: #e5e7eb; font-weight: bold; }
			.text-right { text-align: right; }
			.font-semibold, .font-medium { font-weight: bold; }
		</style>
		<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${escapeHTML(worksheetName(sheetName))}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
	</head>
	<body>${tableHTML}</body>
</html>`;
	const blob = new Blob(["\uFEFF", html], {
		type: "application/vnd.ms-excel;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName.endsWith(".xls")
		? fileName
		: `${fileName}.xls`;
	link.style.display = "none";
	document.body.append(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
