delete from activities_deals where id_ad > 0;
delete from connections where id_connection > 0;
delete from contacts_deals where id_cd > 0;
update activities set id_contact_fu = null;
update activities set id_deal_fu = null;
delete from contacts where id_contact > 0;
delete from deals where id_deal > 0;
delete from activities where id_activity > 0;