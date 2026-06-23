import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase-admin';

const CATEGORIES = [
  'Matériel médical',
  'Loyer / Local',
  'Télécom / Internet',
  'Comptable',
  'Énergie',
  'Assurance',
  'Formation',
  'Fournitures',
  'Logiciel / Abonnement',
  'Autre',
];

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Analyse IA non disponible (clé API manquante)', success: false },
        { status: 503 }
      );
    }

    const { pdfBase64 } = await request.json();

    if (!pdfBase64 || typeof pdfBase64 !== 'string') {
      return NextResponse.json({ error: 'PDF base64 requis' }, { status: 400 });
    }

    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: `Analyse cette facture fournisseur et extrais les informations suivantes au format JSON strict.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{
  "fournisseur_nom": "nom de l'entreprise émettrice",
  "montant": nombre décimal du montant TTC (ou HT si pas de TVA),
  "date_facture": "YYYY-MM-DD",
  "categorie": "une des catégories suivantes"
}

Catégories possibles : ${CATEGORIES.join(', ')}

Si une information est introuvable, utilise null.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Pas de réponse texte' }, { status: 500 });
    }

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'JSON non trouvé dans la réponse' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: {
        fournisseur_nom: parsed.fournisseur_nom || '',
        montant: parsed.montant !== null ? Number(parsed.montant) : null,
        date_facture: parsed.date_facture || null,
        categorie: CATEGORIES.includes(parsed.categorie) ? parsed.categorie : 'Autre',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur parsing facture:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
