import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // On insère toutes les nouvelles données
    const { data, error } = await supabase
      .from('user_cards') // Assurez-vous que votre table s'appelle bien comme ça
      .insert([
        {
          user_id: body.user_id,
          card_id: body.card_id,
          name: body.name,
          set_name: body.set_name,
          image_url: body.image_url,
          
          // Nouveaux champs
          price_bought: body.price_bought,
          condition: body.condition,
          date_bought: body.date_bought,
          location: body.location,
          language: body.language,
          is_graded: body.is_graded,
          grade_note: body.grade_note
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ... Le reste (GET) ne change pas ...
export async function GET(request: Request) {
    // ... votre code existant pour récupérer la collection ...
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if(!userId) return NextResponse.json({error: 'No user'}, {status: 400});

    const { data } = await supabase.from('user_cards').select('*').eq('user_id', userId);
    return NextResponse.json(data);
}