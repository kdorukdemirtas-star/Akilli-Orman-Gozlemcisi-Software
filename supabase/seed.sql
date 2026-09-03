-- Optional seed so the map is not empty before the RX board exists.
-- Lookout only reads packets from the last 24 hours.
insert into public.packets (station_id, n, t, gps, lat, lon, mq9, a8, a9, rssi, created_at)
values
  ('AOG-DEMO-1', 9100, 18.4, 1, 41.22490, 27.88800, 1180, 1, 1, -81, now() - interval '23 hours'),
  ('AOG-DEMO-1', 9101, 19.6, 1, 41.22493, 27.88803, 1196, 1, 1, -81, now() - interval '22 hours'),
  ('AOG-DEMO-1', 9102, 20.7, 1, 41.22496, 27.88806, 1212, 1, 1, -81, now() - interval '21 hours'),
  ('AOG-DEMO-1', 9103, 21.9, 1, 41.22499, 27.88809, 1228, 1, 1, -81, now() - interval '20 hours'),
  ('AOG-DEMO-1', 9104, 23.0, 1, 41.22502, 27.88812, 1244, 1, 1, -81, now() - interval '18 hours'),
  ('AOG-DEMO-1', 9105, 24.1, 1, 41.22505, 27.88815, 1260, 1, 1, -81, now() - interval '16 hours'),
  ('AOG-DEMO-1', 9106, 25.3, 1, 41.22508, 27.88818, 1276, 1, 1, -81, now() - interval '14 hours'),
  ('AOG-DEMO-1', 9107, 26.4, 1, 41.22511, 27.88821, 1292, 1, 1, -81, now() - interval '12 hours'),
  ('AOG-DEMO-1', 9108, 27.6, 1, 41.22514, 27.88824, 1308, 1, 1, -81, now() - interval '10 hours'),
  ('AOG-DEMO-1', 9109, 28.7, 1, 41.22517, 27.88827, 1324, 1, 1, -81, now() - interval '8 hours'),
  ('AOG-DEMO-1', 9110, 29.9, 1, 41.22520, 27.88830, 1340, 1, 1, -81, now() - interval '6 hours'),
  ('AOG-DEMO-1', 9111, 31.0, 1, 41.22523, 27.88833, 1356, 1, 1, -81, now() - interval '5 hours'),
  ('AOG-DEMO-1', 9112, 18.4, 1, 41.22526, 27.88836, 1372, 1, 1, -81, now() - interval '4 hours'),
  ('AOG-DEMO-1', 9113, 19.6, 1, 41.22529, 27.88839, 1388, 1, 1, -81, now() - interval '3 hours'),
  ('AOG-DEMO-1', 9114, 22.8, 1, 41.22532, 27.88842, 1404, 1, 1, -81, now() - interval '2 hours'),
  ('AOG-DEMO-1', 9115, 24.5, 1, 41.22535, 27.88845, 1420, 1, 1, -81, now() - interval '90 minutes'),
  ('AOG-DEMO-1', 9116, 26.1, 1, 41.22538, 27.88848, 1436, 1, 1, -81, now() - interval '60 minutes'),
  ('AOG-DEMO-1', 9117, 27.4, 1, 41.22541, 27.88851, 1452, 1, 1, -81, now() - interval '40 minutes'),
  ('AOG-DEMO-1', 9118, 28.2, 1, 41.22544, 27.88854, 1468, 1, 1, -81, now() - interval '25 minutes'),
  ('AOG-DEMO-1', 9119, 29.0, 1, 41.22547, 27.88857, 1484, 1, 1, -81, now() - interval '15 minutes'),
  ('AOG-DEMO-1', 9120, 29.6, 1, 41.22550, 27.88860, 1500, 1, 1, -81, now() - interval '8 minutes'),
  ('AOG-DEMO-1', 9121, 30.1, 1, 41.22553, 27.88863, 1516, 1, 1, -81, now() - interval '4 minutes'),
  ('AOG-DEMO-1', 9122, 30.4, 1, 41.22556, 27.88866, 1532, 1, 1, -81, now() - interval '90 seconds'),
  ('AOG-DEMO-1', 9123, 30.8, 1, 41.22559, 27.88869, 1548, 1, 1, -81, now() - interval '20 seconds');
