'use strict';

const TABLE = 'Offers';
const COLUMN = 'status';
const ENUM_TYPE = 'enum_Offers_status';
const CANONICAL = ['draft', 'in_progress', 'offer_generated', 'ordered', 'cancelled'];
const LEGACY = ['draft', 'in_progress', 'offer_ready', 'waiting', 'ordered', 'cancelled'];

async function enumTypeExists(queryInterface) {
  const [rows] = await queryInterface.sequelize.query(`
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = '${ENUM_TYPE}'
  `);
  return rows.length > 0;
}

module.exports = {
  async up(queryInterface) {
    const exists = await enumTypeExists(queryInterface);
    if (!exists) return;

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        ALTER TABLE "${TABLE}" ALTER COLUMN "${COLUMN}" DROP DEFAULT;
        ALTER TABLE "${TABLE}" ALTER COLUMN "${COLUMN}" TYPE TEXT USING "${COLUMN}"::text;
        UPDATE "${TABLE}"
        SET "${COLUMN}" = CASE
          WHEN LOWER(REPLACE("${COLUMN}", '-', '_')) = 'offer_ready' THEN 'offer_generated'
          WHEN LOWER(REPLACE("${COLUMN}", '-', '_')) = 'waiting' THEN 'offer_generated'
          WHEN LOWER(REPLACE("${COLUMN}", '-', '_')) IN ('draft', 'in_progress', 'offer_generated', 'ordered', 'cancelled')
            THEN LOWER(REPLACE("${COLUMN}", '-', '_'))
          ELSE 'draft'
        END;
        DROP TYPE IF EXISTS "${ENUM_TYPE}";
        CREATE TYPE "${ENUM_TYPE}" AS ENUM (${CANONICAL.map((value) => `'${value}'`).join(', ')});
        ALTER TABLE "${TABLE}"
          ALTER COLUMN "${COLUMN}" TYPE "${ENUM_TYPE}"
          USING "${COLUMN}"::"${ENUM_TYPE}";
        ALTER TABLE "${TABLE}" ALTER COLUMN "${COLUMN}" SET DEFAULT 'draft';
      `, { transaction });
    });
  },

  async down(queryInterface) {
    const exists = await enumTypeExists(queryInterface);
    if (!exists) return;

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        ALTER TABLE "${TABLE}" ALTER COLUMN "${COLUMN}" DROP DEFAULT;
        ALTER TABLE "${TABLE}" ALTER COLUMN "${COLUMN}" TYPE TEXT USING "${COLUMN}"::text;
        UPDATE "${TABLE}"
        SET "${COLUMN}" = 'offer_ready'
        WHERE "${COLUMN}" = 'offer_generated';
        DROP TYPE IF EXISTS "${ENUM_TYPE}";
        CREATE TYPE "${ENUM_TYPE}" AS ENUM (${LEGACY.map((value) => `'${value}'`).join(', ')});
        ALTER TABLE "${TABLE}"
          ALTER COLUMN "${COLUMN}" TYPE "${ENUM_TYPE}"
          USING "${COLUMN}"::"${ENUM_TYPE}";
        ALTER TABLE "${TABLE}" ALTER COLUMN "${COLUMN}" SET DEFAULT 'draft';
      `, { transaction });
    });
  },
};
