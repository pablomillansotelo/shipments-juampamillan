-- Shipments Backend initial migration

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_status') THEN
    CREATE TYPE "shipment_status" AS ENUM ('pending','packed','shipped','in_transit','delivered','exception','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_event_type') THEN
    CREATE TYPE "shipment_event_type" AS ENUM ('created','packed','picked_up','in_transit','out_for_delivery','delivered','exception');
  END IF;
END $$;

-- API keys
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" serial PRIMARY KEY NOT NULL,
  "key_hash" text NOT NULL,
  "name" text NOT NULL,
  "scopes" jsonb,
  "rate_limit" integer DEFAULT 100,
  "expires_at" timestamp,
  "created_by" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp,
  "is_active" text DEFAULT 'active',
  CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);

-- Shipments
CREATE TABLE IF NOT EXISTS "shipments" (
  "id" serial PRIMARY KEY NOT NULL,
  "order_id" integer NOT NULL,
  "status" "shipment_status" DEFAULT 'pending' NOT NULL,
  "carrier" text,
  "tracking_number" text,
  "tracking_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_shipments_order_id" ON "shipments" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_shipments_status" ON "shipments" ("status");

-- Tracking events
CREATE TABLE IF NOT EXISTS "shipment_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "shipment_id" integer NOT NULL,
  "type" "shipment_event_type" NOT NULL,
  "location" text,
  "message" text,
  "occurred_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'shipment_events_shipment_id_shipments_id_fk'
  ) THEN
    ALTER TABLE "shipment_events"
      ADD CONSTRAINT "shipment_events_shipment_id_shipments_id_fk"
      FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id")
      ON DELETE cascade;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_shipment_events_shipment_id" ON "shipment_events" ("shipment_id");
CREATE INDEX IF NOT EXISTS "idx_shipment_events_occurred_at" ON "shipment_events" ("occurred_at");


