create table agents (
	id_agent serial primary key,
	timestamp_created timestamp with time zone default current_timestamp,
	agent_name_first text,
	agent_name_last text,
	agent_email text,
	agent_password text,
	agent_permissions text[],
	agent_pw_reset boolean
);

create table activities (
	id_activity serial primary key,
	timestamp_created timestamp with time zone default current_timestamp,
	id_activity_temp text,
	id_agent integer references agents(id_agent),

	date_convo_year integer,
	date_convo_month integer,
	date_convo_day integer,
	date_convo_timestamp timestamp with time zone,
		
	convo_relationship integer references value_lists(id),
	convo_main_purpose integer references value_lists(id),
	convo_method integer references value_lists(id),
	convo_tone integer references value_lists(id),
	convo_model integer references value_lists(id),
	convo_intentional integer references value_lists(id),
	convo_type integer references value_lists(id),
	convo_voice_note integer references value_lists(id),
	convo_problem_solve integer references value_lists(id),
	convo_outcome integer references value_lists(id),
	convo_notes text,
	convo_deal_found integer references value_lists(id),
		
	-- follow-up fields below populate from follow-ups array upon save
	date_fu_year integer,
	date_fu_month integer,
	date_fu_day integer,
	date_fu_timestamp timestamp with time zone,

	id_activity_fu integer references activities(id_activity),
	id_deal_fu integer references deals(id_deal),
	id_contact_fu integer references contacts(id_contact),

	id_contact_fu_temp text,
	id_who_introduced_temp text,
	id_deal_fu_temp text,

	fu_purpose integer references value_lists(id),
	fu_notes text
	-- end follow-up fields
);

create table connections (
	id_connection serial primary key,
	id_agent integer references agents(id_agent),
	timestamp_created timestamp with time zone default current_timestamp,
	id_contact integer references contacts(id_contact),
	id_activity integer references activities(id_activity),

	connection_type integer references value_lists(id),
	connection_record_type text,
	connection_vp_reference text,
	connection_notes text
);

create table contacts (
	id_contact serial primary key,
	timestamp_created timestamp with time zone default current_timestamp,
	id_agent integer references agents(id_agent),
	-- id_activity integer references activities(id_activity),
	id_contact_temp text,
	id_who_introduced integer references contacts(id_contact),

	contact_vp_status integer,
	contact_how_met integer references value_lists(id),
	contact_where_met integer references value_lists(id),
	contact_where_met_notes text,
	contact_notes text,
	contact_vp_categories text[],
	contact_name_first text,
	contact_name_last text,
	contact_phone text,
	contact_email text,
	contact_company text,
	contact_title text,
	contact_tags text[],
	contact_address_street text,
	contact_address_city text,
	contact_address_state text,
	contact_address_zip text,
	contact_birth_month integer,
	contact_birth_day integer,
	contact_birth_year integer,

	contact_url text,

	id_vp_app integer references vp_app(id_vp_app)
);

create table vp_app (
	id_vp_app serial primary key,
	timestamp_created timestamp with time zone default current_timestamp,
	id_agent integer references agents(id_agent),
	id_contact integer references contacts(id_contact),
	vp_temp_id text,
	vp_app_status integer,

	vp_type text,
	vp_name_business text,
	vp_phone text,
	vp_email text,
	vp_url text,
	vp_area text,
	vp_contact_person text,
	vp_review_url text,
	vp_agree text,
	vp_ref1 text,
	vp_ref2 text,
	vp_ref3 text

);

create table contacts_deals (
	id_cd serial primary key,
	id_agent integer references agents(id_agent),
	timestamp_created timestamp with time zone default current_timestamp,
	id_contact integer references contacts(id_contact),
	id_deal integer references deals(id_deal)
);

create table deals (
	id_deal serial primary key,
	timestamp_created timestamp with time zone default current_timestamp,
	id_agent integer references agents(id_agent),
	id_deal_temp text,

	deal_name text,
	deal_address text,
	deal_how_found integer references value_lists(id),
	deal_how_found_categ integer references value_lists(id),
	deal_trigger integer references value_lists(id),
	deal_type integer references value_lists(id),
	deal_stage integer references value_lists(id),
	deal_timeline_stated integer references value_lists(id),
	deal_timeline_status integer references value_lists(id),
	deal_notes text,

	deal_value float,
	deal_value_status integer references value_lists(id),
	deal_commission_rate integer references value_lists(id),
	deal_gci float,
	
	date_deal_year integer,
	date_deal_month integer,
	date_deal_day integer,
	date_deal_timestamp timestamp with time zone
);

create table activities_deals (
	id_ad serial primary key,
	id_agent integer references agents(id_agent),
	timestamp_created timestamp with time zone default current_timestamp,
	id_activity integer references activities(id_activity),
	id_deal integer references deals(id_deal)
);

alter table contacts add column id_activity integer references activities(id_activity);
alter table deals add column id_activity integer references activities(id_activity);

create table core_values (
	id_cv serial primary key,
	id_agent integer references agents(id_agent),
	timestamp_created timestamp with time zone default current_timestamp,
	cv_label text,
	cv_notes text,
	cv_color text
);

create table daily_plans (
	id_dp serial primary key,
	id_agent integer references agents(id_agent),
	timestamp_created timestamp with time zone default current_timestamp,
	
	date_dp_year integer,
	date_dp_month integer,
	date_dp_day integer,
	date_dp_timestamp timestamp with time zone,

	dp_cv_1 integer references core_values(id_cv),
	dp_cv_2 integer references core_values(id_cv),
	dp_cv_3 integer references core_values(id_cv),

	dp_cv_1_rank integer,
	dp_cv_2_rank integer,
	dp_cv_3_rank integer,

	dp_future_self text,
	dp_convo_enter integer references value_lists(id),
	dp_convo_recap integer references value_lists(id),
	dp_contacts_entered integer references value_lists(id),
	dp_fu_review integer references value_lists(id),
	dp_calendar integer references value_lists(id),
	dp_yesterday_status integer references value_lists(id),
	dp_mindset integer references value_lists(id),
	dp_yesterday_notes text

	dp_convo_goal integer,
	dp_vp_seeking text,
	dp_talk_plan text,
	dp_svc_priority text,
	dp_stabilize_plan text,
	dp_white_space text
);

create table proformae (
	id_pf serial primary key,
	id_agent integer references agents(id_agent),
	timestamp_created timestamp with time zone default current_timestamp,
	
	pf_sale_price float,
	pf_gci_pct float,
	pf_gci_unit float,
	pf_units_year float,
	pf_gci_year float,
	pf_fees_year float,
	pf_fees_unit float,
	pf_team_pct float,
	pf_team_cap float,
	pf_broker_pct float,
	pf_broker_cap float,
	pf_expenses_year float,
	pf_cost_year float,
	pf_profit_year float,
	pf_tax_rate float,
	pf_income_year float,
	pf_income_month float,
	pf_income_gci_pct float,

	pf_close_pct float,
	pf_units_year_rev float,
	pf_this_year_pct float,
	pf_units_year_rev2 float,
	
	pf_convo_deal float,
	pf_convo_deal_calc float,
	pf_convo_year float,
	pf_work_weeks float,
	pf_work_days_week float,
	pf_work_days_year float,
	pf_convo_day float,
	pf_convo_week float,
	pf_convo_month float,

	pf_deals_week float,
	pf_deals_month float
);

create table value_lists (
	id serial primary key,
	timestamp_created timestamp with time zone default current_timestamp,
	label text,
	list text,
	color text,
	value float,
	category text,
	sort_order float
;)