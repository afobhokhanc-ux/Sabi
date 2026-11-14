/* Sabi provider questions. Loaded after data.js and before app.js.
   When a provider sets up their listing they pick the service they offer, and then they are
   asked the questions for that service. questionsFor(service) builds the list:
     QS  questions written for one specific service (up to 2 are used), keyed by service id
     QG  questions for the whole group the service belongs to, used to fill the rest
   Question types: one (pick one answer), many (pick any), text (short free answer). */

const one=(id,q,opts)=>({id:id,q:q,type:'one',opts:opts});
const many=(id,q,opts)=>({id:id,q:q,type:'many',opts:opts});
const text=(id,q,ph)=>({id:id,q:q,type:'text',ph:ph,optional:true});

const AREA_OPTS=['Ikeja and nearby','Lagos Mainland','Lagos Island','Lekki and Ajah','Outside Lagos'];
const REG3=['Yes','Application in progress','No'];
const YESNO=['Yes','No'];

/* Questions for each group. The first ones are the most useful, so they are used first. */
const QG={
 care:[
  one('care-where','Where do you work?',['At my shop or salon','I visit customers','Both']),
  one('care-book','How do customers book you?',['Walk-ins welcome','Appointments only','Both']),
  many('care-who','Who do you serve?',['Men','Women','Children'])
 ],
 home:[
  one('home-emerg','Do you take emergency call-outs?',['Yes, any time','Yes, daytime only','No']),
  one('home-mat','Who supplies the materials?',['I bring tools and materials','I bring tools only','Depends on the job']),
  many('home-area','Where will you travel to?',AREA_OPTS)
 ],
 auto:[
  one('auto-where','Where do you work?',['At my workshop','I come to the customer','Both']),
  many('auto-veh','Which vehicles do you handle?',['Saloon cars','SUVs and jeeps','Buses and vans','Trucks','Motorcycles and keke']),
  one('auto-warr','Do you give a warranty on your work?',['No','1 week','1 month','3 months or more'])
 ],
 tech:[
  many('tech-how','How do you work with clients?',['In person','Remotely']),
  one('tech-bill','How do you usually charge?',['Fixed price per job','By the hour','Monthly retainer']),
  text('tech-port','Link to your portfolio or past work','https://')
 ],
 biz:[
  one('biz-reg','Are you registered or licensed to practise?',REG3),
  many('biz-clients','Who are your clients?',['Individuals','Small businesses','Large companies','Government or NGOs']),
  one('biz-free','Do you offer a free first consultation?',YESNO)
 ],
 food:[
  one('food-type','What do you mainly cook for?',['Events and parties','Everyday orders','Both']),
  one('food-min','What is your smallest order?',['No minimum','Up to 10 people','10 to 50 people','50 people or more']),
  one('food-cert','Do you have a food handler certificate or health permit?',REG3)
 ],
 edu:[
  many('edu-level','Which levels do you teach?',['Primary','Secondary','University','Adults and professionals']),
  many('edu-where','Where do lessons take place?',['At my place','At the student’s home','Online']),
  one('edu-qual','What is your highest qualification?',['Secondary school','OND or NCE','Bachelor’s degree','Master’s degree or higher','Professional certificate'])
 ],
 health:[
  one('health-reg','Are you registered with your professional body?',REG3),
  one('health-home','Do you do home visits?',['Yes','No','On request']),
  many('health-lang','Which languages do you speak with patients?',['English','Yoruba','Igbo','Hausa','Pidgin'])
 ],
 fashion:[
  one('fashion-order','What kind of orders do you take?',['Custom orders only','Ready-made only','Both']),
  one('fashion-mat','Do you work with the customer’s own materials?',['Yes','No, I supply materials','Either']),
  one('fashion-rush','Can you do rush orders?',['Yes, for an extra fee','No'])
 ],
 events:[
  many('events-types','Which events do you work?',['Weddings','Birthdays','Corporate events','Concerts and parties','Religious events']),
  one('events-travel','Will you travel outside Lagos?',['Yes','No','Depends on the job']),
  one('events-notice','How much notice do you need?',['Less than 3 days','1 week','2 weeks','1 month or more'])
 ],
 security:[
  one('sec-lic','Are you licensed or registered?',REG3),
  one('sec-vet','Are your staff background-checked?',['Yes, all of them','Some of them','No']),
  one('sec-24','Do you offer 24-hour cover?',YESNO)
 ],
 agri:[
  one('agri-scale','How big is your operation?',['Small','Medium','Large']),
  one('agri-deliv','Can you deliver to customers?',['Yes, within Lagos','Yes, anywhere in Nigeria','No, customers collect']),
  one('agri-visit','Can customers visit your farm?',['Yes','By appointment','No'])
 ],
 daily:[
  one('daily-trans','How do you get around?',['On foot','Motorbike','Car','Van or truck']),
  many('daily-area','Which areas do you cover?',['Ikeja and nearby','Lagos Mainland','Lagos Island','Lekki and Ajah']),
  one('daily-wk','Are you available on weekends?',['Yes','Saturdays only','No'])
 ]
};

/* Questions written for one service. These come first, then the group questions. */
const QS={
 'barber':[many('barber-styles','Which styles are you best at?',['Low cuts and fades','Afro and natural hair','Beard shaping','Hair dye','Kids cuts']),one('barber-chairs','How many barbers work in your shop?',['Just me','2 to 3','4 or more'])],
 'hairdresser-hairstylist':[many('hs-do','What do you do?',['Relaxers','Wash and style','Wigs and weaves','Colour','Natural hair care']),one('hs-prod','Do customers bring their own products?',['Yes','No, I supply them','Either'])],
 'hair-braider':[many('braid-styles','Which braid styles do you offer?',['Cornrows','Box braids','Knotless braids','Fulani braids','Twists']),one('braid-time','How long does a full set usually take?',['Under 3 hours','3 to 5 hours','5 to 8 hours','More than 8 hours'])],
 'makeup-artist':[many('mua-for','What do you do makeup for?',['Everyday','Weddings and bridal','Photoshoots','Events and parties']),one('mua-prod','Whose products do you use?',['My own kit','Customer brings their own','Either'])],
 'nail-technician':[many('nail-do','Which services do you offer?',['Gel polish','Acrylics','Nail art','Extensions','Nail repair']),one('nail-hyg','Do you sterilise your tools between customers?',YESNO)],
 'tailor':[many('tailor-do','What do you sew?',['Native and traditional wear','Suits and shirts','Gowns and dresses','Kids clothes','Alterations and repairs']),one('tailor-fab','Do you sell fabric?',['No, customer brings fabric','Yes, I can source fabric','Both'])],
 'fashion-designer':[many('fd-do','What do you design?',['Womenswear','Menswear','Kidswear','Bridal','Corporate uniforms']),one('fd-sketch','Do you show a sketch before you start?',['Yes','No','On request'])],
 'laundry-and-dry-cleaning':[one('laundry-pick','Do you do pickup and delivery?',['Yes, free','Yes, for a fee','No']),many('laundry-do','What do you clean?',['Everyday clothes','Suits and gowns','Bedding and curtains','Shoes and bags'])],
 'massage-therapist':[many('massage-types','Which massages do you offer?',['Swedish','Deep tissue','Sports','Aromatherapy','Prenatal']),one('massage-cert','Are you a trained or certified therapist?',['Yes','No, I trained on the job'])],
 'tattoo-artist':[many('tat-styles','Which styles do you do?',['Fine line','Realism','Tribal','Lettering','Cover-ups']),one('tat-hyg','Do you use new needles and sterile equipment for every client?',YESNO)],
 'plumber':[many('plumb-do','Which jobs do you take?',['Leaks and burst pipes','Toilets and bathrooms','Water heaters','Boreholes and pumps','New installations']),one('plumb-tank','Do you work on water tanks?',YESNO)],
 'electrician':[many('elec-do','Which jobs do you take?',['Sockets and switches','Full rewiring','Inverters and solar','Generator changeover','Fault finding']),one('elec-cert','Do you hold a trade certificate or licence?',REG3)],
 'carpenter':[many('carp-do','What do you make or fix?',['Doors and windows','Wardrobes and cabinets','Kitchen units','Roof timber','Furniture repair']),one('carp-wood','Which materials do you work with?',['Solid wood','Plywood and MDF','Both'])],
 'painter':[many('paint-do','Which jobs do you take?',['Interior walls','Exterior walls','Ceilings','Wood and metal','Decorative finishes']),one('paint-buy','Who buys the paint?',['Customer','I do, and add it to the quote','Either'])],
 'house-cleaner':[many('clean-do','What do you clean?',['Homes and flats','Offices','After building work','Move-in or move-out']),one('clean-team','Do you work alone or with a team?',['Alone','Small team','Large team'])],
 'pest-control-fumigation':[many('pest-do','Which pests do you treat?',['Cockroaches','Bedbugs','Rats','Termites','Mosquitoes']),one('pest-safe','Are your products safe for children and pets?',['Yes','Depends on the treatment'])],
 'ac-installation-and-repair':[many('ac-do','Which AC types do you work on?',['Split units','Window units','Standing units','Industrial units']),one('ac-gas','Do you supply AC gas and parts?',['Yes','No','Some'])],
 'generator-repairer':[many('gen-do','Which generators do you repair?',['Small petrol','Large petrol','Diesel','Industrial']),one('gen-parts','Do you stock spare parts?',['Yes','Some','No, I order them'])],
 'refrigerator-repairer':[one('fridge-do','What do you repair?',['Fridges and freezers','Chest freezers','Commercial cold rooms','All of these']),one('fridge-gas','Do you refill gas on site?',YESNO)],
 'mechanic':[many('mech-do','Which jobs do you take?',['Engine and gearbox','Brakes and suspension','AC and cooling','Servicing','Computer diagnosis']),one('mech-spare','Do you supply spare parts?',['Yes','No','Some'])],
 'auto-electrician':[many('autoel-do','Which jobs do you take?',['Batteries','Alternators and starters','Wiring faults','Lights and sensors','Car audio']),one('autoel-scan','Do you have a diagnostic scanner?',YESNO)],
 'car-wash':[many('cw-do','What do you offer?',['Exterior wash','Interior vacuum','Waxing','Engine wash']),one('cw-where','Where do you wash cars?',['At my car wash','I come to the customer','Both'])],
 'tyre-repairer':[many('tyre-do','What do you offer?',['Puncture repair','New tyres','Wheel balancing','Alignment']),one('tyre-road','Do you go to cars stuck on the road?',YESNO)],
 'towing-services':[one('tow-trucks','What kind of trucks do you have?',['Flatbed','Hook and chain','Both']),one('tow-range','How far will you tow?',['Within Lagos','Lagos and nearby states','Anywhere in Nigeria'])],
 'driving-instructor':[one('drive-car','Whose car is used for lessons?',['Mine','The learner’s','Either']),one('drive-lic','Are you a licensed instructor?',REG3)],
 'car-rental':[many('rent-fleet','What is in your fleet?',['Saloon cars','SUVs','Buses','Luxury cars']),one('rent-driver','Can you provide a driver?',['Yes','No','Optional'])],
 'dispatch-rider':[one('rider-bike','What do you ride?',['Motorcycle','Bicycle','Van']),one('rider-box','Do you have a delivery box or bag?',YESNO)],
 'logistics-and-delivery':[one('log-range','How far do you deliver?',['Within Lagos','Lagos and nearby states','Nationwide']),many('log-size','Which parcel sizes do you carry?',['Documents and small parcels','Medium parcels','Large and heavy items'])],
 'website-developer':[many('web-do','What do you build?',['Business websites','Online stores','Web apps','Landing pages','WordPress sites']),one('web-host','Do you handle hosting and domain setup?',['Yes','No','For an extra fee'])],
 'software-developer':[many('sw-do','Which areas do you work in?',['Web apps','Mobile apps','Backend and APIs','Desktop software','AI and data']),one('sw-team','Do you work alone or with a team?',['Alone','With a team'])],
 'graphic-designer':[many('gd-do','What do you design?',['Logos and branding','Flyers and posters','Social media graphics','Packaging','Print materials']),one('gd-rev','How many rounds of changes do you include?',['1','2','3','Unlimited'])],
 'phone-repairer':[many('phone-brand','Which phones do you repair?',['iPhone','Samsung','Tecno, Infinix and itel','Xiaomi','All brands']),one('phone-parts','Which parts do you use?',['Original','Compatible','Both, and I tell the customer'])],
 'computer-repairer':[many('pc-do','What do you repair?',['Laptops','Desktops','Printers','Networking','Data recovery']),one('pc-mac','Do you repair Apple Macs?',YESNO)],
 'photographer':[many('photo-do','What do you shoot?',['Weddings','Portraits','Events','Products','Real estate']),one('photo-edit','What do you deliver?',['Edited photos','Edited and raw files','Photos on the day'])],
 'videographer':[many('video-do','What do you shoot?',['Weddings','Events','Promos and adverts','Music videos','Documentaries']),one('video-drone','Do you have a drone?',YESNO)],
 'video-editor':[many('ve-do','What do you edit?',['YouTube videos','Reels and TikToks','Promos','Weddings','Music videos']),one('ve-soft','Which software do you use?',['Premiere Pro','Final Cut','DaVinci Resolve','CapCut','Other'])],
 'digital-marketer':[many('dm-do','What do you do?',['Social media ads','Google ads','SEO','Email marketing','Influencer campaigns']),one('dm-report','Do you send monthly reports?',YESNO)],
 'social-media-manager':[many('smm-plat','Which platforms do you manage?',['Instagram','TikTok','Facebook','X','LinkedIn']),one('smm-content','Do you create the content as well?',['Yes','No, I only post and manage'])],
 'lawyer':[many('law-area','Which areas of law do you practise?',['Property and land','Business and contracts','Family','Criminal','Employment']),one('law-bar','Are you called to the Nigerian Bar?',YESNO)],
 'accountant':[many('acc-do','What do you do?',['Bookkeeping','Annual accounts','Payroll','Audit support','Tax filing']),one('acc-body','Are you a member of ICAN or ANAN?',REG3)],
 'real-estate-agent':[many('re-do','What do you handle?',['Rentals','Sales','Land','Commercial property','Short lets']),one('re-fee','How do you charge?',['Commission','Fixed fee','Both'])],
 'event-planner':[many('ep-do','What events do you plan?',['Weddings','Birthdays','Corporate events','Baby showers','Funerals and memorials']),one('ep-size','What is the biggest event you have planned?',['Up to 50 guests','50 to 200 guests','200 to 500 guests','Over 500 guests'])],
 'catering':[many('cat-do','What do you serve?',['Nigerian dishes','Continental dishes','Small chops','Desserts','Drinks']),one('cat-staff','Do you provide serving staff?',['Yes','No','For an extra fee'])],
 'baker':[many('bake-do','What do you bake?',['Bread','Cakes','Cupcakes','Pastries','Cookies']),one('bake-notice','How much notice do you need for cake orders?',['Same day','1 to 2 days','3 to 5 days','1 week or more'])],
 'private-chef':[many('chef-do','Which cuisines do you cook?',['Nigerian','Continental','Asian','Healthy and vegetarian','Grill and BBQ']),one('chef-shop','Do you buy the ingredients?',['Yes, added to the price','No, the customer does','Either'])],
 'private-tutor':[many('tutor-sub','Which subjects do you teach?',['Mathematics','English','Sciences','Business and accounting','Computer skills']),many('tutor-exam','Which exams do you prepare students for?',['JAMB','WAEC or NECO','IELTS or TOEFL','None'])],
 'music-instructor':[many('music-inst','What do you teach?',['Piano and keyboard','Guitar','Drums','Voice','Saxophone and brass']),one('music-level','Which levels do you teach?',['Beginners only','Beginners and intermediate','All levels'])],
 'doctor-general-practitioner':[one('doc-type','What kind of practice do you run?',['Clinic','Hospital','Home visits only','Online consultations']),one('doc-urgent','Do you see urgent cases?',YESNO)],
 'dentist':[many('dent-do','What treatments do you offer?',['Check-ups and cleaning','Fillings and extractions','Braces','Whitening','Root canal']),one('dent-clinic','Do you have your own clinic?',['Yes','No, I work in a hospital'])],
 'nurse':[many('nurse-do','What care do you give?',['Injections and dressings','Wound care','Elderly care','Postnatal care','Night nursing']),one('nurse-reg','Are you registered with the Nursing and Midwifery Council?',REG3)],
 'pharmacist':[one('pharm-type','Do you run a pharmacy?',['Yes, my own shop','No, I work in someone else’s','Online only']),one('pharm-deliv','Do you deliver medicines?',YESNO)],
 'dj':[many('dj-do','Which events do you play?',['Weddings','Birthdays','Clubs and lounges','Corporate events','Religious events']),one('dj-equip','Do you bring speakers and lights?',['Speakers and lights','Speakers only','No, DJ only'])],
 'security-guard':[one('guard-type','What kind of guards do you supply?',['Uniformed guards','Plain-clothes guards','Both']),one('guard-dog','Do you supply guard dogs?',YESNO)],
 'locksmith':[many('lock-do','Which jobs do you take?',['Door lock changes','Car keys','Safes','Lockouts','Padlocks and gates']),one('lock-id','Do you check proof of ownership before opening a lock?',['Yes, always','No'])],
 'poultry-farmer':[many('poul-do','What do you sell?',['Day-old chicks','Broilers','Point-of-lay hens','Eggs','Turkey']),one('poul-bulk','Do you sell in bulk?',YESNO)],
 'fish-farmer':[many('fish-do','What do you sell?',['Fresh catfish','Smoked fish','Fingerlings','Tilapia']),one('fish-pond','Do you also set up ponds for others?',YESNO)],
 'errand-runner':[many('err-do','What errands do you run?',['Shopping and pick-ups','Bill payments','Queueing and paperwork','Delivering documents']),one('err-hours','When are you available?',['Mornings','Afternoons','Evenings','All day'])],
 'babysitting':[many('baby-age','Which ages are you comfortable with?',['Babies','Toddlers','School-age children']),one('baby-aid','Are you first-aid trained?',YESNO)],
 'nanny-services':[one('nanny-live','Do you live in or live out?',['Live in','Live out','Either']),one('nanny-exp','How much experience do you have?',['Under 1 year','1 to 3 years','3 to 5 years','5 years or more'])],
 'pet-grooming':[many('pet-do','Which pets do you groom?',['Dogs','Cats','Rabbits and small pets']),one('pet-where','Where do you groom?',['At my place','I visit the pet','Both'])],
 'borehole-drilling':[one('bore-depth','How deep can you drill?',['Up to 60 metres','60 to 100 metres','Over 100 metres']),one('bore-survey','Do you do a site survey first?',YESNO)],
 'septic-tank-evacuation':[one('sept-truck','What size trucks do you have?',['Small','Medium','Large']),one('sept-site','Do you dispose of waste at an approved site?',YESNO)],
 'gas-delivery':[many('gas-do','What do you offer?',['Gas refills','New cylinders','Cooker and regulator fitting']),many('gas-size','Which cylinder sizes do you refill?',['3 kg','6 kg','12.5 kg','25 kg or more'])],
 'moving-and-relocation-services':[many('move-do','What do you move?',['Homes and flats','Offices','Heavy items','Fragile items']),one('move-pack','Do you pack and unpack?',['Yes','No','For an extra fee'])],
 'cctv-installer':[many('cctv-do','What do you install?',['Home CCTV','Office CCTV','Wireless cameras','Remote viewing on a phone']),one('cctv-warr','What warranty do you give on equipment?',['None','6 months','1 year','2 years or more'])],
 'tiler':[many('tile-do','What do you tile?',['Floors','Walls','Bathrooms','Outdoor areas']),one('tile-buy','Who buys the tiles and cement?',['Customer','I do','Either'])],
 'roofer':[many('roof-do','Which roofs do you work on?',['Aluminium','Stone-coated','Long-span sheets','Clay tiles']),one('roof-leak','Do you fix leaks as well as fit new roofs?',YESNO)],
 'pop-installer':[many('pop-do','What do you install?',['Plain POP ceilings','Designs and cornices','Wall panels']),one('pop-buy','Who buys the materials?',['Customer','I do','Either'])],
 'interior-decorator':[many('int-do','What do you decorate?',['Living rooms','Bedrooms','Offices','Full-home makeover']),one('int-buy','Can you buy furniture and decor for the client?',YESNO)],
 'furniture-maker':[many('furn-do','What do you make?',['Beds and wardrobes','Sofas','Dining sets','Office furniture']),one('furn-deliv','Do you deliver and assemble?',['Yes','Delivery only','No'])],
 'gardener':[many('gard-do','What do you do?',['Lawn mowing','Planting','Pruning','Landscaping']),one('gard-tools','Do you bring your own tools?',YESNO)],
 'pool-maintenance':[one('pool-visit','How often can you visit?',['One-off jobs','Weekly','Monthly']),one('pool-chem','Do you supply pool chemicals?',YESNO)],
 'water-tank-cleaning':[one('tank-type','Which tanks do you clean?',['Plastic','Concrete','Overhead and underground']),one('tank-disinf','Do you disinfect after cleaning?',YESNO)]
};

/* The questions a provider of this service is asked: up to 2 for the service, then group questions. */
function questionsFor(svc){
  const own=(QS[svc.id]||[]).slice(0,2);
  const grp=(QG[svc.groups[0]]||[]).slice(0,own.length?2:3);
  return own.concat(grp);
}
