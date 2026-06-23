interface SendInvoiceEmailParams {
  accessToken: string;
  email: string;
  nomPatient: string;
  factureId: string;
  nomTherapeute: string;
  titreTherapeute: string;
  telephoneTherapeute: string;
  emailTherapeute: string;
  logoUrlTherapeute: string;
  cabinetNom?: string;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<void> {
  const lienFacture = `${window.location.origin}/facture/${params.factureId}`;

  await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({
      email: params.email,
      nomPatient: params.nomPatient,
      lienFacture,
      nomTherapeute: params.nomTherapeute,
      titreTherapeute: params.titreTherapeute,
      telephoneTherapeute: params.telephoneTherapeute,
      emailTherapeute: params.emailTherapeute,
      logoUrlTherapeute: params.logoUrlTherapeute,
      cabinetNom: params.cabinetNom,
    }),
  });
}
