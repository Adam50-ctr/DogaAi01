pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

const fileInput = document.getElementById("fileInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");
const loadingDiv = document.getElementById("loading");

async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      const typedarray = new Uint8Array(this.result);
      pdfjsLib.getDocument(typedarray).promise.then((pdf) => {
        const maxPages = 10;
        const pagesToRead = Math.min(pdf.numPages, maxPages);
        if (pdf.numPages > maxPages) {
          alert(
            `Figyelem: Csak az első ${maxPages} oldal kerül feldolgozásra!`
          );
        }
        let textPromises = [];
        for (let i = 1; i <= pagesToRead; i++) {
          textPromises.push(
            pdf
              .getPage(i)
              .then((page) => page.getTextContent())
              .then((content) =>
                content.items.map((item) => item.str).join(" ")
              )
          );
        }
        Promise.all(textPromises).then((pages) => {
          resolve(pages.join("\n"));
        });
      });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

analyzeBtn.addEventListener("click", async () => {
  const files = fileInput.files;
  if (!files.length) return;

  loadingDiv.classList.remove("hidden");
  resultDiv.classList.add("hidden");
  resultDiv.innerHTML = "";

  let fullText = "";
  for (let file of files) {
    const text = await extractTextFromPDF(file);
    fullText += text + "\n";
  }

  try {
    const response = await fetch("/.netlify/functions/gpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullText }),
    });

    const data = await response.json();
    resultDiv.textContent = data.result || "Nincs eredmény.";
  } catch (err) {
    resultDiv.textContent = "Hiba történt az elemzés során.";
  }

  resultDiv.classList.remove("hidden");
  loadingDiv.classList.add("hidden");
});
