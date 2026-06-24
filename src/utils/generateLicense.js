import jsPDF from 'jspdf';

export const generatePDFLicense = (userName, trackTitle, licenseType) => {
  const doc = new jsPDF();
  
  // Set some styling
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("LICENSE AGREEMENT", 105, 20, null, null, "center");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const date = new Date().toLocaleDateString();

  const content = `
    This License Agreement is made on ${date} between:
    
    PRODUCER: Black Vybez (VybezVerse)
    LICENSEE: ${userName}
    
    BEAT TITLE: ${trackTitle}
    LICENSE TYPE: ${licenseType}
    
    TERMS & CONDITIONS:
    1. The Producer grants the Licensee the right to use the Beat in their musical projects.
    2. This is a non-exclusive license unless specified as "Exclusive Stems".
    3. The Licensee may distribute the track on streaming platforms (Spotify, Apple Music) 
       up to the limits of their chosen license tier.
    4. The Producer retains all underlying copyright and ownership of the original composition.
    5. The Licensee must credit "Prod. by Black Vybez" in all releases.
    
    By completing the purchase on Payhip, the Licensee agrees to all terms associated 
    with the ${licenseType} tier as described on the VybezVerse official store.
    
    Authorized by: Black Vybez (VybezMadeThis)
  `;

  // Split text to fit width
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 15, 40);

  // Save the PDF
  doc.save(`${trackTitle.replace(/\s+/g, '_')}_${licenseType}_License.pdf`);
};
