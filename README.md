# Compassion Ministry CBO — Admin

Next.js + TailwindCSS + TypeScript + Supabase admin panel.

## Features
- Admin login (Supabase Auth)
- Create / edit / delete content posts (text + images)
- Upload images to Supabase Storage
- Publish / draft toggle
- Change password
- Sign out

## Setup

1. Create a Supabase project at https://supabase.com
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create an admin user in Supabase Auth (Authentication -> Users -> Add user) using email/password.
4. Promote that user to admin in the SQL editor:
   ```sql
   update public.users set role = 'admin' where email = 'your-admin@email.com';
   ```
5. Copy `.env.local.example` values into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Install and run:
   ```
   npm install
   npm run dev
   ```

Open http://localhost:3000 and sign in with the admin credentials.

## Note on running
This machine uses Node v24, whose native SWC binary is incompatible with Next.js 16. The npm scripts use `--webpack` so builds/dev run via the WASM fallback. If you have a compatible Node (18/20/22 LTS), you can remove `--webpack` from the scripts.
