-- seed.sql: Sample placeholder data for beads-store

insert into public.products (name, description, price_inr, image_url, active, sort_order, category, sku)
values
  (
    'Sample Red Crystal Bracelet',
    'Handcrafted beaded bracelet with vibrant crimson beads and silver-tone accents. Placeholder sample for demonstration.',
    499,
    'https://images.unsplash.com/photo-1611591475870-b74d49826a79?auto=format&fit=crop&w=600&q=80',
    true,
    1,
    'bracelet',
    'BR-101'
  ),
  (
    'Sample Blue Glass Bead Necklace',
    'Multi-strand traditional blue glass seed bead necklace with brass clasp. Placeholder sample for demonstration.',
    1299,
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    true,
    2,
    'necklace',
    'NL-101'
  ),
  (
    'Sample Pastel Pearl Anklet',
    'Delicate pastel beaded anklet featuring freshwater-style synthetic beads and durable thread. Placeholder sample for demonstration.',
    349,
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    true,
    3,
    'other',
    'OT-101'
  );
