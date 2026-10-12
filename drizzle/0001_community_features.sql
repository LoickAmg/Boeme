CREATE TABLE "corpse_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"corpse_id" integer NOT NULL,
	"position" integer NOT NULL,
	"line" text NOT NULL,
	"user_id" uuid,
	"author_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corpses" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"theme" text DEFAULT '' NOT NULL,
	"target_lines" integer DEFAULT 12 NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "daily_features" (
	"day" varchar(10) PRIMARY KEY NOT NULL,
	"poem_id" integer NOT NULL,
	"chosen_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "corpse_lines" ADD CONSTRAINT "corpse_lines_corpse_id_corpses_id_fk" FOREIGN KEY ("corpse_id") REFERENCES "public"."corpses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corpse_lines" ADD CONSTRAINT "corpse_lines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corpses" ADD CONSTRAINT "corpses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_features" ADD CONSTRAINT "daily_features_poem_id_poems_id_fk" FOREIGN KEY ("poem_id") REFERENCES "public"."poems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_features" ADD CONSTRAINT "daily_features_chosen_by_users_id_fk" FOREIGN KEY ("chosen_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "corpse_lines_position_unique" ON "corpse_lines" USING btree ("corpse_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "corpses_slug_unique" ON "corpses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "corpses_status_idx" ON "corpses" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_features_poem_unique" ON "daily_features" USING btree ("poem_id");