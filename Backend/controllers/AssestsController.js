import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const addPointAsset = async (req, res) => {
  const { type, category, kpin, status, Details } = req.body;

  try {
    // Convert longitude and latitude to numbers
    const longitude = parseFloat(req.body.longitude);
    const latitude = parseFloat(req.body.latitude);

    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    // Cloudinary image URLs from multer
    const uploadedUrls = req.files.map((file) => file.path);

    const result = await prisma.$executeRawUnsafe(
      `
      INSERT INTO "Asset" (type, category, kpin, status, "Images", "Details", point)
      VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326)::geometry(Point, 4326))
      `,
      type,
      category,
      kpin,
      status,
      JSON.stringify(uploadedUrls),
      Details,
      longitude,
      latitude
    );

    res.status(201).json({ message: "Point asset registered successfully", result });
  } catch (error) {
    console.error("Error registering point asset:", error);
    res.status(500).json({ error: "Failed to register point asset", details: error.message });
  }
};

const addLineStringAsset = async (req, res) => {
  let { type, category, kpin, status, Details, coordinates } = req.body;

  try {
    // Cloudinary image URLs from multer
    const uploadedUrls = req.files.map((file) => file.path);

    // Format coordinates into LINESTRING
    coordinates = JSON.parse(coordinates);
    let lineString = coordinates.map(([lng, lat]) => `${lng} ${lat}`).join(", ");
    const geometry = `LINESTRING(${lineString})`;

    const result = await prisma.$executeRawUnsafe(
      `
      INSERT INTO "Asset" (type, category, kpin, status, "Images", "Details", line)
      VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_GeomFromText($7), 4326)::geometry(LineString, 4326))
      `,
      type,
      category,
      kpin,
      status,
      JSON.stringify(uploadedUrls),
      Details,
      geometry
    );

    res.status(201).json({ message: "LineString asset registered successfully", result });
  } catch (error) {
    console.error("Error registering LineString asset:", error);
    res.status(500).json({ error: "Failed to register LineString asset", details: error.message });
  }
};
const fetchMapAssets = async (req, res) => {
  const { longitude, latitude, assetType } = req.body;
  const radius = 200; // 200 meters

  try {
    let query = `
      SELECT 
        "id",
        "type",
        "Details",
        "status",
        "category",
        "Images",
        "kpin",
        "Company",
        "pfrequency",
        CASE 
          WHEN "point" IS NOT NULL 
            THEN ST_AsGeoJSON("point"::geometry)
          WHEN "line" IS NOT NULL 
            THEN ST_AsGeoJSON("line"::geometry)
        END AS geometry
      FROM "Asset"
      WHERE ST_DWithin(
        COALESCE("point", "line"),
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, 
        ${radius}
      )
    `;

    if (assetType && assetType !== 'All') {
      query += ` AND "type" = '${assetType}'`;
    }

    const assets = await prisma.$queryRawUnsafe(query);

    // Convert geometry JSON strings into objects
    const formattedAssets = assets.map(asset => ({
      ...asset,
      geometry: asset.geometry ? JSON.parse(asset.geometry) : null
    }));

    res.status(200).json(formattedAssets);
  } catch (error) {
    console.error('Error fetching map assets:', error);
    res.status(500).json({ error: 'Failed to fetch map assets', details: error.message });
  }
};
const deleteAsset = async (req, res) => {
  let { assetId } = req.body;

  if (!assetId) {
    return res.status(400).json({ error: "Asset ID is required" });
  }

  assetId = Number(assetId)
  try {
    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM "Asset" WHERE id = $1`,
      assetId
    );

    if (result === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.status(200).json({ message: `Asset with ID ${assetId} deleted successfully` });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({ error: "Failed to delete asset", details: error.message });
  }
};

export default {
  addPointAsset,
  addLineStringAsset,
  fetchMapAssets,
  deleteAsset, // ✅ add export here
};


