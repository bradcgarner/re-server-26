create table coaching (
	id_coach serial primary key,
	timestamp_created timestamp with time zone default current_timestamp,
	
	coach text,
	coach_category text,
	scheme text,
	sort_order float,
	one text, 
	two text,
	three text
);

insert into coaching (coach, scheme, coach_category, one, two, sort_order) values 
('EWTS - EG', 'QA',  'interest', 'A home was just listed near theirs',
'I''m not sure if it''s for you, but your neighbor is selling their home and I can put together a report on how their sale will impact your home''s value.',
1),

('EWTS - EG', 'QA',  'interest', 'A notable home just hit the market.',
'I just found a property near your home that''s going to sell very quickly. I''m not sure if it''s for you, but I can get you all the deails just in cse you have a friend who''s looking to buy.',
3),

('EWTS - EG', 'QA',  'interest', 'You have an upcoming open house.',
'I have an open house coming up in your area. Who do you know that might like living near you?',
5),

('EWTS - EG', 'QA',  'interest', 'I''m just browsing.',
'I''m not sure if they''re for you, but I have a few homes that are similar to the one you inquired about that I could share with you.',
'Don''t worry, I work with clients during all stages of the buying process, some of whom are many years out and just browsing, and some of whom want to buy sooner or later.',
7),

('EWTS - EG', 'QA',  'interest', 'I''m just browsing',
'Would it help if I sent you listings that aren''t on zillow while you browse?',
8),

('EWTS - EG', 'QA',  'interest', 'Unresponsive',
'VM: I''m guessing you haven''t gotten around to reviewing the list of properties I sent over. Text me a good time for us to chat.',
'VM: If I could find the perfect home for you, then would you be interested in having a quick chat? Please text me a good time for us to chat and review your search.',
9),

('EWTS - EG', 'QA',  'interest', 'Promote a listing you have coming soon to the market',
'Who do you know that might want to get access to a home before it hits the market?',
11),

('EWTS - EG', 'QA',  'interest', 'Promoting market stats',
'How important is it to you to be aware of all the homes that are selling near you?',
13),

('EWTS - EG', 'QA',  'interest', 'How''s the market?',
'I can put together a detailed report for your neighborhood. If I do that, would you look at it?',
15),

('EWTS - EG', 'QA',  'interest', 'I just want to know how much my home is worth',
'I''ve prepared a new home value report for you. When would be a good time for you to review it',
17),



('EWTS - EG', 'QA',  'interest', 'I just want to know if the home is still for sale.',
'I can look that up for you. The good news is, either way, I also have access to homes that aren''t on Zillow and I cfan prepare a list of those for you.',
19),

('EWTS - EG', 'QA',  'interest', 'Touch base with me in a few weeks',
'Would it help if in the meantime I sent you a list of homes that recently sold near yours?',
21),

('EWTS - EG', 'QA',  'interest', 'Expanding your services',
'I''m not sure if it''s for you, but if you''re interested in buying an investment property in the future, I an keep you in the loop on any dood deals that come on the market. ',
23),

('EWTS - EG', 'QA',  'interest', 'Reconnecting after a long period of ignoring the customer',
'I was thinking about you today and as I promised when we worked together, I wanted to reach out to let you know that I am here whenever you might need advice or an update on what''s happening in your local market.',
25),

('EWTS - EG', 'QA',  'interest', 'How did I get my information',
'I''m following up, as promised, because you registered on our website.',
27),




('EWTS - EG', 'QA',  'referral', 'Asking for a review',
'Would you be open-minded to shooting a quick video to share your experience working with me? I know it would help a lot of people just like you.',
31),

('EWTS - EG', 'QA',  'referral', 'Asking for a referral',
'I''m going to ask you to think of someone who could benefit from my services. Don''t worry if you don''t know who that person is right  now, I''ll give you some time to think about it before I check back.',
33),




('EWTS - EG', 'QA',  'agent selection', 'I''m going to relist with the same agent again',
'How important is it that the next time you list your property, it actually sells for a price you''re happy with?',
41),

('EWTS - EG', 'QA',  'agent selection', 'We''re going to use the same agent who helped us last time.',
'I can prepare a plan to help you sell you home, and at the very least, you''ll have something to compare to theirs. Would you be open-minded to exploring all your options before you make your final decision?',
43),

('EWTS - EG', 'QA',  'agent selection', 'I''m just goimg to use Zillow.',
'What''s you''re experience in selling your home without guidance from a realtor?',
45),

('EWTS - EG', 'QA',  'agent selection', 'I already have interest.',
'Just out of curiosity, did any of them put in an offer?',
47);

('EWTS - EG', 'QA',  'agent selection', 'I can sell my house without you.',
'Just out of curiosity, do you know why the average customer sells their own home for significantly less than when represented by a professional real estate agent?',
49),

('EWTS - EG', 'QA',  'agent selection', 'My friend just sold their home without an agent.',
'Could it be possible that your friend left money on the table by not hiring a professional?',
51),

('EWTS - EG', 'QA',  'agent selection', 'I''m going to buy a house without an agent.',
'What makes you say that?',
53),

('EWTS - EG', 'QA',  'agent selection', 'I don''t want to be tied down with a listing agreement.',
'The good news i that I have a simple cancellation policy with my agreement. If you''re not happy with my services, you can cancel the agreement.',
55),

('EWTS - EG', 'QA',  'agent selection', 'Bring me a buyer and we can talk.',
'The good news is I work with a lot of serious buyers. When would you like me to bring one over?',
57),

('EWTS - EG', 'QA',  'agent selection', 'Why shouldn''t I just list with the #1 company or agent?',
'Just imagine what it''s going to be like to have an agent who treats you like their only client. That''s the level of dedication I have to the people I work with and my results reflect that.',
59),

('EWTS - EG', 'QA',  'agent selection', 'I''m going to be meeting with a few other real estate agents',
'When would be a good time to connect after you''ve had a chance to meet with all the other agents you''re interviewing?',
61),

('EWTS - EG', 'QA',  'agent selection', 'My friend / relative is a real estate agent. ',
'Could it be possible that mixing family and business is a bad idea?',
63),

('EWTS - EG', 'QA',  'agent selection', 'I''m going to interview a few more agents',
'Help me understand what you''re looking for in the perfect agent.',
65),

('EWTS - EG', 'QA',  'agent selection', 'I''m just going to list my home with a discount broker',
'Before you make up your mind, can I send you an in-depth report about how much I think your home sell for?',
67),

('EWTS - EG', 'QA',  'agent selection', 'I''m going to list with a discount broker.',
'What''s your experience working with a full-service agent?',
'What do you understand about the different levels of service in real estate?',
69),

('EWTS - EG', 'QA',  'agent selection', 'I''m going to list my house without a realtor',
'Before you make up your mind, let me send you a breakdown of how I think I could actually make you more money than if you sold it by yourself, including my fees',
71),

('EWTS - EG', 'QA',  'agent selection', 'I don''t need a buyer''s agent yet.',
'What''s your experience with selling your home without guideance from a realtor?',
73),

('EWTS - EG', 'QA',  'agent selection', 'I want to work direclty with the listing agent...',
'How certain are you that the listing agent will have your best interest in mind?',
75),

('EWTS - EG', 'QA',  'agent selection', 'Just out of curiosity, what would you consider the top 3 criteria you''re looking for in the perfect agent?',
77),




('EWTS - EG', 'QA',  'commission', 'Before we meet, how much do you charge?',
'...',
101),

('EWTS - EG', 'QA',  'commission', 'I''m not willing to pay commission.',
'Would it help if you only paid commission if we secure a buyer at or above the asking price?',
103),




('EWTS - EG', 'QA',  'list price', 'I''m not willing to lower my asking price.',
'How would you feel if six months from now your home was still on the market?',
111),

('EWTS - EG', 'QA',  'list price', 'I want to list my home at $x (way above market value)',
'I understant that you think your home is worth $X, but how open-minded are you to pricing it lower than that if it could create a bidding war?',
113),

('EWTS - EG', 'QA',  'list price', 'I think that your suggest price is too low.',
'Help me understand your experience with pricing homes.',
115),

('EWTS - EG', 'QA',  'list price', 'My home is better than the comps you used and deserves a higher price.',
117),

('EWTS - EG', 'QA',  'list price', 'Suggesting a price reduction','...',
119),



('EWTS - EG', 'QA',  'list concerns', 'Why haven''t we had more offers?',
'Don''t worry, it''s natural to feel frustrated when you have a lot of showings with no offers. That just means we have to get creative about how we price the home to draw more attention. ',
131),

('EWTS - EG', 'QA',  'list concerns', 'Did we accept an offer too soon:',
'Don''t worry, it''s natural to feel that way. Would it help if I told you that every seller feels the same when they finally accept an offer to sell their home?',
133),




('EWTS - EG', 'QA',  'purchase price', 'I don''t think I can afford to buy a new home',
'Would it help if I could show you how your mortgage payment could be less than what you pay for rent?',
141),




('EWTS - EG', 'QA',  'purchase concerns', 'We lost out because we should have offered more.',
'How open minded are you to looking at something that could be perfect but a little over your budget?',
147),

('EWTS - EG', 'QA',  'purchase concerns', 'i think we offered too much money.',
'Don''t worry, most buyers have some remorse after their offer is accepted. It''s natural. ',
149),




('EWTS - EG', 'QA',  'timing', '',
'I''m  not ready to relist.',
'Most people in y our situation feel the same way. They believe thier home is never going to sell, but I can prove to you that we can sell your home for price you''ll be happy with.',
161),

('EWTS - EG', 'QA',  'timing', 'I''m not in a hurry.',
'If I can prove to you that I will generate serious buyers for your home, would you be open-minded to listing with me down the road?',
163),

('EWTS - EG', 'QA',  'timing', 'I''m not in a hurry.',
'Would you be open-minded to selling your home sooner if we find the perfect buyer this month?',
165),

('EWTS - EG', 'QA',  'timing', 'I want to wait until the busy season.',
'There may be fewer homes for sale right now, but there are plenty of serious buyers. Are you open-minded to listing sooner?',
167),

('EWTS - EG', 'QA',  'timing', 'Asking if they are going to sell this year.',
'Most people are wondering if now is a good time to sell their home. Just out of curiosity, have you given any thoughts to selling yours recently?',
169),

('EWTS - EG', 'QA',  'timing', 'I''m not looking to sell right now',
'Would you be open-minded to finding out how much your home is on track to be worth when you are ready to sell?',
171),



('EWTS - EG', 'QA',  'improvements', 'I''m not willing to stage my home or make any improvements',
'If I could show you how staging your home or making improvements could result in a higher profit, then would be open to the idea of discussing it as an option?',
201),

('EWTS - EG', 'QA',  'improvements', 'I''m not willing to stage my home.',
'Would you be open minded to staging if you know your home would sell for more because of it?',
203),

('EWTS - EG', 'QA',  'improvements', 'I want to wait until I can make a few repairs to the home.',
'Most people want their house to be HGTV ready before they list. But how would you feel if the repairs you want to make don''t result in any additional profit?',
205),



('EWTS - EG', 'QA',  'caution', 'I want to find my next house before I sell this one.',
'Don''t worry, I''ve helped many people who have been in the exact same position you are in right now.',
211),

('EWTS - EG', 'QA',  'caution', 'Will you offer me a guarantee?',
'If you''re willing to follow my advice and list your home for the right price, then it will sell.',
213),

('EWTS - EG', 'QA',  'caution', 'We''re going to have to think about it.',
'If I can show you some data about the difference between selling your home now and waiting six months, then would that help you make a better decision?',
215),

('EWTS - EG', 'QA',  'caution', 'I need to talk to my spouse.',
'I bet you''re a bit like me and you run every important decision by your spouse. What questions you think they will have that I can answer for you now?',
217),

('EWTS - EG', 'QA',  'caution', 'I want to find the perfect home, and I''m willing to wait.',
'Would you be open-minded to me making some small suggestion to your search criteria to help you find that perfect home?',
219),

('EWTS - EG', 'QA',  'caution', 'I''m waiting for the perfect home.',
'That''s smart. The good news is I can help you find it.',
221),


