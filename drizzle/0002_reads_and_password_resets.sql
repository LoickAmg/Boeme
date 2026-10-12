CREATE TABLE "password_resets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poem_reads" (
	"poem_id" integer NOT NULL,
	"reader" text NOT NULL,
	"day" varchar(10) NOT NULL,
	CONSTRAINT "poem_reads_poem_id_reader_day_pk" PRIMARY KEY("poem_id","reader","day")
);
--> statement-breakpoint
ALTER TABLE "poems" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poems" ADD COLUMN "reader_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poem_reads" ADD CONSTRAINT "poem_reads_poem_id_poems_id_fk" FOREIGN KEY ("poem_id") REFERENCES "public"."poems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "password_resets_user_idx" ON "password_resets" USING btree ("user_id");