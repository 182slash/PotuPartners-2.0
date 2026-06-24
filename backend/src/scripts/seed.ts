#!/usr/bin/env ts-node
/**
 * seed.ts — Creates the initial admin account and sample staff members.
 *
 * Run ONCE after running migrations on a fresh database:
 *   npx ts-node src/scripts/seed.ts
 *
 * Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running, OR
 * edit the defaults below (change them immediately after first login).
 */

import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });

const BCRYPT_ROUNDS = parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10);

interface SeedUser {
  email:        string;
  password:     string;
  fullName:     string;
  displayName:  string;
  role:         'admin' | 'partner' | 'associate';
  title:        string;
  bio:          string;
  specialty:    string;
  linkedinUrl:  string;
}

const SEED_USERS: SeedUser[] = [
  {
    email:       process.env['ADMIN_EMAIL'] ?? 'admin@potupartners.site',
    password:    process.env['ADMIN_PASSWORD'] ?? 'ChangeMe!SecurePassword2024',
    fullName:    'System Administrator',
    displayName: 'Admin',
    role:        'admin',
    title:       'System Administrator',
    bio:         '',
    specialty:   '',
    linkedinUrl: '',
  },
  {
    email:       'rolland.potu@potupartners.site',
    password:    'TempPass!2024#Partner',
    fullName:    'Rolland E. Potu, S.H., M.H.',
    displayName: '. Potu',
    role:        'partner',
    title:       'Founding & Managing Partner',
    bio:         'Rolland is the founder of Potu and Partners Law Office. He was graduated from Faculty of Law Wijaya Kusuma University Surabaya and finished his Master Degree at Airlangga University Surabaya. His specialization is a Private Law, Civil and Criminal Litigation, Property Law, Corporate Law and Capital Market.',
    specialty:   'Corporate Litigation · International Arbitration',
    linkedinUrl: '',
  },
  {
    email:       'gesang.taufiqurochman@potupartners.site',
    password:    'TempPass!2024#Partner2',
    fullName:    'Gesang Taufikurochman, S.H.',
    displayName: 'G. Taufikurochman',
    role:        'partner',
    title:       'Co-Managing Partner',
    bio:         'Gesang is a C0-Managing Partners in Potu and Partners Law Office. He get a bachelor degree of law in Faculty Of Law Wijaya Kusuma University, Surabaya.',
    specialty:   'Mergers & Acquisitions · Regulatory Affairs',
    linkedinUrl: '',
  },
  {
    email:       'miswar.tomagola@potupartners.site',
    password:    'TempPass!2024#Partner3',
    fullName:    'Miswar Tomagola, S.H.',
    displayName: 'M. Tomagola',
    role:        'partner',
    title:       'Co-Managing Partner',
    bio:         'Miswar is a Co-Managing Partners in Potu and Partners Law Office. He gets a Bachelor Degree of Law in Faculty of Law State Islamic University of Abdul Muthalib Sangadji, Ambon.',
    specialty:   'Constitutional Law · Civil Rights',
    linkedinUrl: '',
  },
  {
    email:       'adrian.cakhalino@potupartners.site',
    password:    'TempPass!2024#Partner4',
    fullName:    'Adrian Cakhalino, S.H.',
    displayName: 'A. Cakhalino',
    role:        'partner',
    title:       'Col-Lawyer',
    bio:         'Adrian is a C0-Lawyer at Potu and Partners Law Office. He earned his Bachelor of Law from the Faculty of Law at the University of Surabaya.',
    specialty:   'Real Estate · Corporate Restructuring',
    linkedinUrl: '',
  },
  {
    email:       'albert.potu@potupartners.site',
    password:    'TempPass!2024#Staff1',
    fullName:    'Albert R. Potu, S.E.',
    displayName: 'A. Potu',
    role:        'associate',
    title:       'Public Relation',
    bio:         'Albert is a Public Relation who graduated from the Faculty of Economy, Wijaya Kusuma University.',
    specialty:   'Public Relations · Communications',
    linkedinUrl: '',
  },
  {
    email:       'marchellina.shagyna@potupartners.site',
    password:    'TempPass!2024#Staff2',
    fullName:    'Marchellina Shagyna, S.H.',
    displayName: 'M. Shagyna',
    role:        'associate',
    title:       'Senior Paralegal',
    bio:         'Marchellina is a Senior Paralegal who graduated from the Faculty of Law, Brawijaya University.',
    specialty:   'Legal Research · Litigation Support',
    linkedinUrl: '',
  },
  {
    email:       'mario.sukoto@potupartners.site',
    password:    'TempPass!2024#Staff3',
    fullName:    'Mario Febrianto Sukoto, S.H.',
    displayName: 'M. Sukoto',
    role:        'associate',
    title:       'Paralegal',
    bio:         'Mario is a Paralegal who graduated from the Faculty Of Law Airlangga University Surabaya.',
    specialty:   'Drafting · Case Management',
    linkedinUrl: '',
  },
  {
    email:       'alifia.safitri@potupartners.site',
    password:    'TempPass!2024#Staff4',
    fullName:    'Alifia Nur Safitri, S.H.',
    displayName: 'A. Safitri',
    role:        'associate',
    title:       'Paralegal',
    bio:         'Alifia is a Paralegal who graduated from the Faculty of Law, Surabaya States University.',
    specialty:   'Regulatory Filings · Documentation',
    linkedinUrl: '',
  },
  {
    email:       'immanuel.hendra@potupartners.site',
    password:    'TempPass!2024#Staff5',
    fullName:    'Immanuel Hendra, S.H.',
    displayName: 'I. Hendra',
    role:        'associate',
    title:       'Paralegal',
    bio:         'Immanuel is Paralegal who graduated from the Faculty of Law, University of Surabaya.',
    specialty:   'Due Diligence · Contract Review',
    linkedinUrl: '',
  },
  {
    email:       'dimas.azizi@potupartners.site',
    password:    'TempPass!2024#Staff6',
    fullName:    'Dimas Aqil Azizi, S.H.',
    displayName: 'D. Azizi',
    role:        'associate',
    title:       'Paralegal',
    bio:         'Dimas is a Paralegal who graduated from the Faculty of Law, Brawijaya University.',
    specialty:   'Court Procedures · Compliance',
    linkedinUrl: '',
  },
  {
    email:       'vanessa.handayani@potupartners.site',
    password:    'TempPass!2024#Partner5',
    fullName:    'Vanessa Handayani, S.H.',
    displayName: 'V. Handayani',
    role:        'partner',
    title:       'Co-Lawyer',
    bio:         'Vanessa is a C0-Lawyer at Potu and Partners Law Office. She earned her Bachelor of Law degree from the Faculty of Law at the University of Surabaya.',
    specialty:   'Civil Law · Dispute Resolution',
    linkedinUrl: '',
  },
];

async function seed(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('\n🌱  Starting database seed...\n');

    for (const user of SEED_USERS) {
      // Check if already exists
      const { rows: existing } = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );

      if (existing.length > 0) {
        console.log(`  ⏭  Skipping ${user.email} (already exists)`);
        continue;
      }

      const passwordHash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
      const id           = uuidv4();

      await client.query(
        `INSERT INTO users (
          id, email, password_hash, full_name, display_name, role,
          title, bio, specialty, linkedin_url, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6::user_role,
          $7, $8, $9, $10, true
        )`,
        [
          id,
          user.email,
          passwordHash,
          user.fullName,
          user.displayName,
          user.role,
          user.title,
          user.bio,
          user.specialty,
          user.linkedinUrl || null,
        ]
      );

      console.log(`  ✅  Created ${user.role}: ${user.fullName} <${user.email}>`);
    }

    console.log('\n🎉  Seed complete!\n');
    console.log('⚠️   IMPORTANT: Change all staff passwords immediately after first login.');
    console.log('    Admin login: ' + SEED_USERS[0]!.email);
    console.log('    Admin password: [as set in ADMIN_PASSWORD env var]\n');

  } catch (err) {
    console.error('\n❌  Seed failed:', (err as Error).message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
