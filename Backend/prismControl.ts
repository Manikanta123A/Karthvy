import { PrismaClient } from "@prisma/client";

export async function createAsset(data: {
  type: string,
  category: string,
  latitude: number,
  longitude: number,
  frequency: number,
  status: string
}) {
  return PrismaClient.$executeRawUnsafe(`
    INSERT INTO "Asset" (type, category, location, frequency, status)
    VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6)
  `, data.type, data.category, data.longitude, data.latitude, data.frequency, data.status);
}


export async function getAssetsNear(latitude: number, longitude: number, radiusMeters: number) {
  return PrismaClient.$queryRawUnsafe(`
    SELECT id, type, category, frequency, status,
           ST_AsGeoJSON(location) as location
    FROM "Asset"
    WHERE ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
      $3
    )
  `, longitude, latitude, radiusMeters);
}
