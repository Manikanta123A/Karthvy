import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const addPointAsset = async (req, res) => {
  const { type, category, kpin, frequency, status, Images, Details, longitude, latitude } = req.body;

  try {
    const result = await prisma.$executeRaw`
      INSERT INTO "Asset" (type, category, kpin, frequency, status, "Images", "Details", point)
      VALUES (${type}, ${category}, ${kpin}, ${frequency}, ${status}, ${Images}, ${Details}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geometry(Point, 4326))
    `;

    res.status(201).json({ message: 'Point asset registered successfully', result });
  } catch (error) {
    console.error('Error registering point asset:', error);
    res.status(500).json({ error: 'Failed to register point asset', details: error.message });
  }
};

const addLineStringAsset = async (req, res) => {
  const { type, category, kpin, frequency, status, Images, Details, coordinates } = req.body; // coordinates should be an array of [longitude, latitude] pairs

  try {
    // Format coordinates into a LINESTRING string
    const lineString = coordinates.map(coord => `${coord[0]} ${coord[1]}`).join(', ');
    const geometry = `LINESTRING(${lineString})`;

    const result = await prisma.$executeRaw`
      INSERT INTO "Asset" (type, category, kpin, frequency, status, "Images", "Details", line)
      VALUES (${type}, ${category}, ${kpin}, ${frequency}, ${status}, ${Images}, ${Details}, ST_SetSRID(ST_GeomFromText(${geometry}), 4326)::geometry(LineString, 4326))
    `;

    res.status(201).json({ message: 'LineString asset registered successfully', result });
  } catch (error) {
    console.error('Error registering LineString asset:', error);
    res.status(500).json({ error: 'Failed to register LineString asset', details: error.message });
  }
};

export default {
  addPointAsset,
  addLineStringAsset,
};
