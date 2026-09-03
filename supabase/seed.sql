-- Optional seed so the map is not empty before the RX board exists.
-- Lookout only reads packets from the last 24 hours.
-- Coordinates are Dicle Üniversitesi (public demo pin).
insert into public.packets (station_id, n, t, gps, lat, lon, mq9, a8, a9, rssi, created_at)
values
  ('AOG-DEMO-1', 9100, 18.4, 1, 37.91920, 40.26800, 1180, 1, 1, -81, now() - interval '23 hours'),
  ('AOG-DEMO-1', 9101, 19.6, 1, 37.91920, 40.26800, 1196, 1, 1, -81, now() - interval '22 hours'),
  ('AOG-DEMO-1', 9102, 20.7, 1, 37.91920, 40.26800, 1212, 1, 1, -81, now() - interval '21 hours'),
  ('AOG-DEMO-1', 9103, 21.9, 1, 37.91920, 40.26800, 1228, 1, 1, -81, now() - interval '20 hours'),
  ('AOG-DEMO-1', 9104, 23.0, 1, 37.91920, 40.26800, 1244, 1, 1, -81, now() - interval '18 hours'),
  ('AOG-DEMO-1', 9105, 24.1, 1, 37.91920, 40.26800, 1260, 1, 1, -81, now() - interval '16 hours'),
  ('AOG-DEMO-1', 9106, 25.3, 1, 37.91920, 40.26800, 1276, 1, 1, -81, now() - interval '14 hours'),
  ('AOG-DEMO-1', 9107, 26.4, 1, 37.91920, 40.26800, 1292, 1, 1, -81, now() - interval '12 hours'),
  ('AOG-DEMO-1', 9108, 27.6, 1, 37.91920, 40.26800, 1308, 1, 1, -81, now() - interval '10 hours'),
  ('AOG-DEMO-1', 9109, 28.7, 1, 37.91920, 40.26800, 1324, 1, 1, -81, now() - interval '8 hours'),
  ('AOG-DEMO-1', 9110, 29.9, 1, 37.91920, 40.26800, 1340, 1, 1, -81, now() - interval '6 hours'),
  ('AOG-DEMO-1', 9111, 31.0, 1, 37.91920, 40.26800, 1356, 1, 1, -81, now() - interval '5 hours'),
  ('AOG-DEMO-1', 9112, 18.4, 1, 37.91920, 40.26800, 1372, 1, 1, -81, now() - interval '4 hours'),
  ('AOG-DEMO-1', 9113, 19.6, 1, 37.91920, 40.26800, 1388, 1, 1, -81, now() - interval '3 hours'),
  ('AOG-DEMO-1', 9114, 22.8, 1, 37.91920, 40.26800, 1404, 1, 1, -81, now() - interval '2 hours'),
  ('AOG-DEMO-1', 9115, 24.5, 1, 37.91920, 40.26800, 1420, 1, 1, -81, now() - interval '90 minutes'),
  ('AOG-DEMO-1', 9116, 26.1, 1, 37.91920, 40.26800, 1436, 1, 1, -81, now() - interval '60 minutes'),
  ('AOG-DEMO-1', 9117, 27.4, 1, 37.91920, 40.26800, 1452, 1, 1, -81, now() - interval '40 minutes'),
  ('AOG-DEMO-1', 9118, 28.2, 1, 37.91920, 40.26800, 1468, 1, 1, -81, now() - interval '25 minutes'),
  ('AOG-DEMO-1', 9119, 29.0, 1, 37.91920, 40.26800, 1484, 1, 1, -81, now() - interval '15 minutes'),
  ('AOG-DEMO-1', 9120, 29.6, 1, 37.91920, 40.26800, 1500, 1, 1, -81, now() - interval '8 minutes'),
  ('AOG-DEMO-1', 9121, 30.1, 1, 37.91920, 40.26800, 1516, 1, 1, -81, now() - interval '4 minutes'),
  ('AOG-DEMO-1', 9122, 30.4, 1, 37.91920, 40.26800, 1532, 1, 1, -81, now() - interval '90 seconds'),
  ('AOG-DEMO-1', 9123, 30.8, 1, 37.91920, 40.26800, 1548, 1, 1, -81, now() - interval '20 seconds');
