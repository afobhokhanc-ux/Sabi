/* Sabi sample data. Loaded before app.js, so everything here is available to it.
   GROUPS     the 13 service groups, with the wording each group uses.
   SERVICES   every service people can search for, built from SERVICE_TEXT below.
   PROVIDERS  made-up businesses. Some are written by hand (HAND), the rest are
              generated from each service's price list so every service has results.
   Later, replace PROVIDERS with a fetch() to your backend. */

const GROUPS=[
 {id:'care',name:'Personal care and grooming',nouns:['Studio','Place','Lounge'],perk:['Home visits','Home visits available, +₦3,000'],scores:['Skill','Cleanliness','Timekeeping','Value'],note:'Prices are per person. Add-ons are agreed before work starts.'},
 {id:'home',name:'Home and domestic services',nouns:['Services','Works','Solutions'],perk:['Emergency 24/7','Emergency call-out 24/7, +₦5,000'],scores:['Workmanship','Tidiness','Timekeeping','Value'],note:'Call-out and labour. Materials are quoted separately.'},
 {id:'auto',name:'Automotive and transport',nouns:['Auto','Garage','Motors'],perk:['Mobile service','They come to you, +₦4,000'],scores:['Workmanship','Honesty','Timekeeping','Value'],note:'Labour only. Parts are quoted separately before any work starts.'},
 {id:'tech',name:'Technology and digital',nouns:['Tech','Digital','Hub'],perk:['Remote support','Remote support available, no travel fee'],scores:['Quality','Communication','Timekeeping','Value'],note:'Fixed prices for small jobs. Larger projects are quoted after a short chat.'},
 {id:'biz',name:'Professional and business',nouns:['Consulting','Advisory','Partners'],perk:['Online sessions','Phone or video sessions available'],scores:['Expertise','Communication','Timekeeping','Value'],note:'Fees cover the first engagement. Ongoing work is agreed in writing.'},
 {id:'food',name:'Food and hospitality',nouns:['Kitchen','Bites','Table'],perk:['Delivery','Delivery available, fee depends on distance'],scores:['Taste','Presentation','Timekeeping','Value'],note:'Event prices depend on guests and menu. The final price is confirmed before booking.'},
 {id:'edu',name:'Education and training',nouns:['Academy','Learning Centre','Tutors'],perk:['Online lessons','Lessons available over video call'],scores:['Teaching','Communication','Timekeeping','Value'],note:'Prices are per session unless stated. Packages cost less per lesson.'},
 {id:'health',name:'Health and medical',nouns:['Clinic','Care','Centre'],perk:['Home visits','Home visits available, +₦5,000'],scores:['Care','Professionalism','Timekeeping','Value'],note:'Fees cover the visit only. Drugs and tests are charged separately. This demo gives no medical advice.'},
 {id:'fashion',name:'Fashion and accessories',nouns:['Designs','Atelier','Crafts'],perk:['Express order','Express order in half the time, +30%'],scores:['Craft','Finishing','Timekeeping','Value'],note:'Prices cover making or repair. Materials are quoted separately unless the listing says otherwise.'},
 {id:'events',name:'Events and entertainment',nouns:['Events','Productions','Entertainment'],perk:['Travels to venue','Travels anywhere in Lagos, transport quoted'],scores:['Performance','Professionalism','Timekeeping','Value'],note:'Prices depend on the date, hours and venue. The final price is confirmed before booking.'},
 {id:'security',name:'Security services',nouns:['Security','Shield','Protect'],perk:['24/7 cover','24-hour cover available'],scores:['Reliability','Professionalism','Timekeeping','Value'],note:'Prices cover labour. Equipment is quoted separately.'},
 {id:'agri',name:'Agricultural services',nouns:['Farms','Agro','Produce'],perk:['Farm visits','Free first visit to your farm'],scores:['Expertise','Reliability','Timekeeping','Value'],note:'Prices are per unit named. Transport is quoted by distance.'},
 {id:'daily',name:'Other everyday services',nouns:['Services','Express','Helpers'],perk:['Same-day','Same-day service, +₦1,500'],scores:['Reliability','Care','Timekeeping','Value'],note:'Prices are for the listed task. Extra items or distance are agreed before starting.'}
];
const GROUP=id=>GROUPS.find(g=>g.id===id);

/* How fast each kind of service is. Each option is [minutes, label]; minutes is used for sorting. */
const SPEED={
 wait:{label:'Usual wait',opts:[[10,'10 min'],[15,'15 min'],[20,'20 min'],[30,'30 min'],[45,'45 min']]},
 arrive:{label:'Arrives in',opts:[[40,'40 min'],[60,'1 hr'],[90,'90 min'],[120,'2 hrs'],[180,'3 hrs'],[240,'4 hrs']]},
 ready:{label:'Ready in',opts:[[180,'3 hrs'],[1440,'1 day'],[2880,'2 days'],[4320,'3 days'],[7200,'5 days'],[10080,'7 days']]},
 slot:{label:'Next slot',opts:[[120,'Today, 2 pm'],[300,'Today, 5 pm'],[1440,'Tomorrow'],[1500,'Tomorrow, 10 am'],[2880,'In 2 days']]},
 reply:{label:'Replies in',opts:[[15,'15 min'],[30,'30 min'],[60,'1 hr'],[120,'2 hrs'],[240,'4 hrs']]},
 start:{label:'Can start',opts:[[1440,'Tomorrow'],[2880,'In 2 days'],[4320,'In 3 days'],[10080,'Next week']]},
 deliver:{label:'Delivers in',opts:[[20,'20 min'],[35,'35 min'],[45,'45 min'],[60,'1 hr'],[90,'90 min']]},
 supply:{label:'Supply in',opts:[[1440,'1 day'],[2880,'2 days'],[4320,'3 days'],[10080,'1 week']]}
};

/* Services that have hand-written providers keep their own wording. */
const CUSTOM={
 'tailor':{label:'Ready in',scores:['Fit','Finishing','Timekeeping','Value'],note:'Sewing fee only. Fabric is bought separately unless the tailor says otherwise.'},
 'barber':{label:'Usual wait',scores:['Cut quality','Cleanliness','Timekeeping','Value'],note:'Prices are per person. Add-ons are agreed at the chair.'},
 'mechanic':{label:'Diagnosis in',scores:['Workmanship','Honesty','Timekeeping','Value'],note:'Labour only. Parts are quoted separately before any work starts.'},
 'electrician':{label:'Arrives in',scores:['Workmanship','Safety','Timekeeping','Value'],note:'Call-out and labour. Materials are quoted separately.'},
 'plumber':{label:'Arrives in',scores:['Workmanship','Cleanliness','Timekeeping','Value'],note:'Call-out and labour. Pipes and fittings are quoted separately.'},
 'phone-repairer':{label:'Fixed in',scores:['Repair quality','Honesty','Timekeeping','Value'],note:'Prices include labour. Parts are quoted by phone model before work starts.'},
 'hairdresser-hairstylist':{label:'Next slot',scores:['Style','Cleanliness','Timekeeping','Value'],note:'Extensions and wigs are bought separately unless the listing says otherwise.'}
};

/* One service per line:  Name | usual first price | speed kind | items | 24 (optional)
   Items are separated by ;  An item written as  Name:price  has its own price, otherwise
   its price is worked out from the first price. A line with only a name adds an existing
   service to another group. */
const SERVICE_TEXT=`
# care
Barber|2000|wait|Haircut;Haircut and beard;Line-up;Hair dye
Hairdresser / Hairstylist|4000|slot|Wash and blow dry;Relaxer or treatment;Wig install;Colour and treatment
Hair braider|8000|slot|Cornrows:6000;Box braids:12000;Knotless braids:25000;Fulani braids:15000
Makeup artist|15000|slot|Natural glam:15000;Full glam:25000;Bridal makeup:80000;Makeup lesson:30000
Nail technician|5000|slot|Gel polish:5000;Acrylic set:12000;Nail art:8000;Full set with design:20000
Manicurist and pedicurist|4000|slot|Manicure:4000;Pedicure:5000;Manicure and pedicure:8000;Spa pedicure:12000
Tailor|9000|ready|Shirt;Trousers;Senator wear;Ankara gown
Fashion designer|35000|ready|Simple dress:35000;Native outfit:50000;Aso-ebi set, per person:30000;Custom design:120000
Laundry and dry cleaning|1500|ready|Wash and fold, per kg:1500;Shirt or blouse:1200;Suit dry clean:6000;Duvet or curtains:8000
Massage therapist|15000|slot|Back massage:15000;Full body massage:25000;Deep tissue massage:30000;Couples massage:50000
Tattoo artist|20000|slot|Small tattoo:20000;Medium tattoo:50000;Large tattoo:120000;Cover-up consultation:10000
Piercer|5000|slot|Ear piercing:5000;Nose piercing:6000;Cartilage piercing:8000;Jewellery change:2000
Spa services|20000|slot|Facial:20000;Body scrub:25000;Full spa package:60000;Couples package:110000
Wig maker|25000|ready|Closure wig:25000;Frontal wig:40000;Custom colour wig:55000;Wig revamp:10000
Shoe repairer|2500|ready|Sole repair:3000;Heel replacement:2500;Stitching:2000;Full restoration:12000
Cobbler|2000|ready|Quick patch:1500;Sole replacement:4000;Zip repair:2500;Polish and restore:6000

# home
Plumber|5000|arrive|Leaking tap or pipe;Toilet repair;Water heater install;Borehole pump check
Electrician|5000|arrive|Socket or switch fit;Ceiling fan install;Inverter wiring;Full rewire
Carpenter|8000|start|Door repair:8000;Wardrobe repair:15000;Custom shelving:40000;Kitchen cabinets:250000
Painter|20000|start|Single room:20000;Two rooms:35000;Full flat interior:120000;Exterior painting:250000
House cleaner|15000|slot|Standard clean:15000;Deep clean:30000;Post-construction clean:60000;Move-out clean:40000
Housekeeper|8000|start|Half day:8000;Full day:12000;Weekly part-time:35000;Monthly full-time:90000
Pest control / fumigation|20000|slot|Cockroach treatment:20000;Bedbug treatment:30000;Full house fumigation:50000;Termite treatment:60000
AC installation and repair|10000|arrive|AC servicing:10000;Gas refill:18000;Split unit install:40000;Compressor repair:55000
Refrigerator repairer|8000|arrive|Diagnosis:5000;Gas refill:15000;Thermostat replacement:12000;Compressor repair:40000
Generator repairer|7000|arrive|Servicing:7000;Carburetor cleaning:10000;AVR replacement:15000;Engine overhaul:60000
CCTV installer|30000|start|Single camera install:30000;2-camera kit:60000;4-camera kit:110000;8-camera kit:200000
Interior decorator|50000|start|Consultation:20000;Living room:150000;Bedroom:120000;Full home:600000
Furniture maker|40000|ready|Side table:40000;Wardrobe:150000;Dining set:300000;Bed frame:120000
Roofer|30000|start|Leak repair:30000;Gutter fitting:60000;Re-roof, per room:150000;Full roof:1200000
Tiler|3500|start|Floor tiles, per sqm:3500;Wall tiles, per sqm:4000;Bathroom retile:80000;Full flat:350000
POP installer|25000|start|Single room:25000;Living room:60000;Full flat:180000;Decorative cornice:35000
Gardener|8000|slot|Lawn mowing:8000;Garden cleanup:15000;Planting:12000;Monthly upkeep:40000
Pool maintenance|25000|slot|Pool cleaning:25000;Chemical balancing:15000;Pump repair:50000;Monthly package:80000
Water tank cleaning|15000|slot|500 litre tank:15000;1,000 litre tank:25000;2,000 litre tank:40000;Large overhead tank:70000
Moving and relocation services|50000|start|Small van:50000;Large van:90000;Truck, 2 bedrooms:150000;Full flat with packing:250000

# auto
Mechanic|5000|arrive|Diagnostic scan;Oil and filter change;Brake pad replacement;Full service
Auto electrician|5000|arrive|Battery check:3000;Wiring fault:12000;Alternator repair:20000;Full electrical diagnosis:15000
Car wash|2500|wait|Basic wash:2500;Wash and vacuum:4000;Interior clean:8000;Wash and wax:10000
Car detailing|25000|slot|Interior detail:25000;Exterior polish:35000;Ceramic coating:150000;Full detail:80000
Tyre repairer|2000|wait|Puncture repair:2000;Tyre change:3000;Wheel balancing:5000;Wheel alignment:8000
Vulcanizer|1500|wait|Puncture repair:1500;Tyre fitting:2500;Valve replacement:1000;Wheel balancing:4000
Auto body repairer|25000|ready|Dent repair:25000;Bumper repair:40000;Panel replacement:80000;Full body work:300000
Spray painter|40000|ready|Single panel:40000;Two panels:70000;Bumper respray:60000;Full respray:350000
Towing services|15000|arrive|Tow within 5 km:15000;Tow within 15 km:30000;Tow across town:50000;Flatbed recovery:70000|24
Driving instructor|8000|slot|One lesson:8000;5 lessons:36000;10 lessons:65000;Test preparation:15000
Car rental|35000|start|Sedan, per day:35000;SUV, per day:60000;With driver, per day:70000;Weekly rental:220000
Dispatch rider|1500|arrive|Within 5 km:1500;5 to 10 km:2500;Across the city:4500;Express run:3500
Logistics and delivery|3000|deliver|Small parcel:3000;Medium parcel:6000;Large parcel:12000;Interstate parcel:15000
Motorcycle repairer|3000|arrive|Servicing:3000;Brake repair:3500;Chain and sprocket:6000;Engine repair:25000

# tech
Website developer|120000|reply|Landing page:120000;Business website:250000;Online store:450000;Monthly maintenance:30000
Software developer|200000|reply|Small tool or script:80000;Mobile app prototype:350000;Custom web app:600000;Monthly retainer:250000
Graphic designer|15000|reply|Logo:25000;Flyer or poster:10000;Brand kit:80000;Social media pack:35000
UI/UX designer|60000|reply|App screen review:25000;Wireframes:60000;Full app design:250000;Design system:300000
Cybersecurity consultant|50000|reply|Security check:50000;Website penetration test:200000;Staff awareness session:80000;Full audit:500000
Computer repairer|5000|ready|Diagnosis:3000;Software reinstall:7000;Screen replacement:45000;Motherboard repair:60000
Phone repairer|3000|ready|Software fix;Charging port repair;Battery replacement;Screen replacement
Data analyst|40000|reply|Data cleaning:40000;Dashboard:120000;Survey analysis:90000;Monthly reporting:150000
Digital marketer|50000|reply|Campaign setup:50000;Ad management, monthly:100000;SEO audit:80000;Full marketing plan:200000
Social media manager|60000|reply|Content calendar:30000;Monthly management:120000;Page setup:25000;Growth package:200000
Video editor|10000|reply|Short clip:10000;Promo video:50000;YouTube video:35000;Wedding highlights:80000
Photographer|25000|slot|Portrait session:25000;Product shoot:60000;Event coverage, half day:80000;Wedding coverage:250000
Videographer|50000|slot|Short promo:60000;Event video:120000;Wedding video:300000;Music video:400000
IT support technician|8000|arrive|Call-out:8000;Office network fix:25000;Printer setup:10000;Monthly support:80000
Network technician|10000|arrive|Wi-Fi setup:15000;Router configuration:10000;Office cabling:60000;Network troubleshooting:20000
CCTV and networking technician|20000|arrive|Camera fault check:10000;Network cabling:50000;CCTV and Wi-Fi setup:120000;Full office setup:300000
Data recovery specialist|20000|ready|Diagnosis:5000;Phone data recovery:25000;Hard drive recovery:60000;Memory card recovery:15000
Printing and photocopying|100|wait|Photocopy, per page:50;Colour print, per page:200;Document binding:1500;Banner printing:12000

# biz
Lawyer|20000|slot|Consultation:20000;Contract review:50000;Tenancy agreement:60000;Property or company matter:250000
Accountant|25000|slot|Consultation:15000;Monthly bookkeeping:60000;Annual accounts:150000;Audit support:250000
Tax consultant|20000|slot|Tax advice:15000;Tax return filing:50000;Business tax setup:80000;Tax clearance help:60000
Business consultant|30000|slot|Discovery call:15000;Business plan:150000;Market research:200000;Monthly advisory:250000
Real estate agent|20000|slot|Property viewing:5000;Rental search:30000;Property listing:50000;Property valuation:80000
Property manager|50000|start|Flat, monthly:50000;Duplex, monthly:120000;Rent collection:80000;Whole estate:500000
Insurance agent|5000|reply|Policy review:5000;Car insurance quote:15000;Health cover set-up:25000;Home or business cover:40000
Recruitment agency|80000|reply|Single role shortlist:80000;Three roles:200000;Executive search:500000;Bulk hiring:400000
Event planner|100000|slot|Consultation:20000;Birthday party:150000;Wedding planning:500000;Corporate event:400000
Branding consultant|60000|reply|Brand review:40000;Logo and colours:120000;Full brand identity:350000;Brand guidelines:200000
Virtual assistant|30000|reply|Per hour:3000;Weekly package:30000;Monthly package:100000;Inbox and calendar, monthly:60000
Secretarial services|3000|ready|Typing, per page:500;Document formatting:3000;Meeting minutes:10000;Monthly office support:80000
Notary services|5000|ready|Document notarisation:5000;Affidavit:8000;Power of attorney:25000;Certified true copy:3000
Business registration consultant|40000|ready|Business name search:5000;Business name registration:40000;Limited company registration:90000;Tax ID and compliance:60000

# food
Catering|120000|slot|Small party, 30 guests:150000;Wedding, 100 guests:500000;Corporate lunch, 50 guests:200000;Custom menu quote:20000
Private chef|40000|slot|Dinner for two:35000;Dinner party:90000;Weekly meal prep:60000;Monthly chef:250000
Restaurant|3500|wait|Main dish:3500;Party jollof tray:25000;Family platter:15000;Table reservation:2000
Food delivery|3000|deliver|Lunch meal:3500;Family meal:12000;Office lunch, 5 plates:20000;Party tray:30000
Baker|8000|ready|Loaf of bread:1500;Box of cupcakes:8000;Birthday cake:20000;Wedding cake:150000
Cake decorator|15000|ready|Basic decoration:10000;Themed cake:35000;Tiered cake:90000;Wedding cake design:180000
Bartender|40000|slot|Home party:40000;Wedding bar:100000;Corporate event:80000;Cocktail class:50000
Waiter|15000|slot|Per waiter, half day:12000;Per waiter, full day:20000;Team of 5:80000;Team of 10:150000
Small chops vendor|20000|ready|Small chops box:8000;Party platter:20000;Cocktail platter:35000;Bulk order, 100 pieces:60000
Event food vendor|60000|slot|Jollof and rice trays:60000;Full buffet:200000;Grilled items:90000;Dessert table:70000
Meal preparation services|25000|slot|Weekly meals:25000;Healthy meal plan:45000;Family meals:60000;Monthly plan:150000
Outdoor cooking / BBQ services|40000|slot|Small BBQ:40000;Grilled fish party:70000;Full BBQ party:150000;Corporate BBQ:200000

# edu
Private tutor|5000|slot|One hour:5000;Weekly package, 4 lessons:18000;Monthly package, 12 lessons:50000;Exam crash course:60000
Home lesson teacher|20000|slot|Weekly lessons, monthly:30000;Primary school, monthly:40000;Secondary school, monthly:60000;Holiday lessons:50000
Music instructor|8000|slot|Trial lesson:5000;Weekly lessons, monthly:40000;Instrument and lessons:80000;Group class:15000
Dance instructor|8000|slot|Trial class:5000;Weekly classes, monthly:35000;Event choreography:60000;Private session:12000
Driving school|60000|slot|Beginner course:70000;Intensive course:90000;Refresher lesson:10000;Licence test help:25000
Computer training|30000|slot|Basic computer skills:30000;Microsoft Office:45000;Graphics design:80000;Monthly course:60000
Coding instructor|40000|slot|Intro to coding:25000;Web development course:120000;Python course:90000;One-on-one mentoring, monthly:80000
Language tutor|6000|slot|English lesson:6000;French lesson:8000;Yoruba or Igbo lesson:5000;Monthly package:50000
Exam preparation services|15000|slot|JAMB prep:35000;WAEC or NECO prep:45000;IELTS prep:80000;Weekend crash course:25000
Vocational training|40000|start|Tailoring course:60000;Catering course:70000;Hair and makeup course:90000;Phone repair course:80000

# health
Doctor / General practitioner|10000|slot|Consultation:10000;Follow-up visit:6000;Home visit:25000;Health check:30000
Dentist|8000|slot|Check-up:8000;Scaling and polishing:15000;Tooth extraction:20000;Filling:25000
Pharmacist|2000|wait|Medicine advice:1000;Prescription filling:2000;Blood pressure check:1000;Health screening:5000
Nurse|8000|slot|Injection or dressing:5000;Wound care:8000;Home nursing visit:15000;Night nursing:40000
Optician|5000|slot|Eye test:5000;Prescription glasses:25000;Contact lens fitting:15000;Lens replacement:15000
Physiotherapist|12000|slot|Assessment:12000;Therapy session:15000;Home session:25000;Package of 5 sessions:65000
Medical laboratory technician|5000|ready|Malaria test:3000;Full blood count:5000;Full health screen:30000;Home sample collection:8000
Ambulance services|15000|arrive|Within 5 km:15000;Across town:30000;With oxygen support:45000;Patient transfer:60000|24
Home nursing|30000|start|Daily visit:15000;Night care:40000;Weekly package:90000;Monthly package:300000
Home healthcare|25000|slot|Doctor home visit:25000;Nurse visit:15000;Lab tests at home:20000;Elderly care visit:20000
Veterinary doctor|7000|slot|Check-up:7000;Vaccination:8000;Treatment:15000;Home visit:20000
Midwife|10000|slot|Antenatal visit:10000;Postnatal visit:12000;Home visit:20000;Delivery support:80000

# fashion
Shoe maker|25000|ready|Sandals:25000;Loafers:40000;Boots:55000;Custom shoes:70000
Shoe repairer
Bag maker|15000|ready|Tote bag:15000;Handbag:25000;Backpack:30000;Custom order:50000
Bead maker|8000|ready|Necklace:8000;Bracelet set:6000;Wedding beads:35000;Custom set:25000
Jewellery maker|20000|ready|Simple ring:20000;Necklace:35000;Custom piece:80000;Repair and resize:8000
Gele stylist|7000|slot|Simple gele:7000;Wedding gele:15000;Group of 5:30000;Home service:12000
Embroidery specialist|10000|ready|Name or logo:5000;Shirt embroidery:10000;Cap embroidery:6000;Bulk order:50000
Clothing alteration specialist|1500|ready|Trouser hem:1500;Zip replacement:2000;Waist adjustment:3000;Dress resize:6000
Shoe cleaner|3000|ready|Sneaker clean:3000;Leather clean:4000;Deep restore:8000;Pickup and delivery:1500
Wristwatch repairer|3000|ready|Battery change:2000;Strap replacement:3000;Glass replacement:6000;Full service:15000
Leather worker|10000|ready|Belt:10000;Wallet:12000;Bag repair:8000;Custom leather piece:40000
Screen printing / T-shirt branding|3500|ready|Single T-shirt:4000;10 T-shirts:35000;30 T-shirts:90000;Custom cap:3500

# events
DJ|60000|slot|Birthday party:60000;Wedding:150000;Club night:120000;Corporate event:100000
MC / Compere|50000|slot|Birthday:40000;Wedding:100000;Corporate event:80000;Concert:150000
Event decorator|80000|slot|Birthday set-up:80000;Wedding decor:400000;Stage decor:200000;Balloon decor:50000
Event planner
Photographer
Videographer
Dancer|30000|slot|Solo performance:30000;Group of 3:70000;Choreography:50000;Wedding entrance:40000
Live band|150000|slot|Two-hour set:150000;Wedding:300000;Corporate event:250000;Full night:400000
Sound engineer|40000|slot|Small event:40000;Wedding:80000;Concert:200000;Studio session:50000
Rental services (chairs, tables, canopies)|300|slot|Chair, each:300;Table, each:2500;Canopy, each:15000;Full set for 100 guests:120000
Ushering services|20000|slot|2 ushers:20000;5 ushers:45000;10 ushers:80000;Full team:150000
Bouncer / Event security|25000|slot|1 bouncer:25000;3 bouncers:65000;5 bouncers:100000;Full event security:250000
Magician|40000|slot|Kids party:40000;Birthday:50000;Corporate event:100000;Stage show:150000
Face painter|15000|slot|Per hour:15000;Kids party:30000;Festival:60000;Full event:100000

# security
Security guard|85000|start|Guard, monthly:85000;Night guard, monthly:80000;Event guard, per night:15000;Team of 3, monthly:240000|24
CCTV installer
Private investigator|50000|reply|Consultation:20000;Background check:60000;Surveillance, per day:80000;Full case:300000
Locksmith|5000|arrive|Lock repair:5000;Lock change:8000;Key cutting:1500;Car key programming:40000|24
Security system installer|80000|start|Alarm and sensors:80000;Electric fence:200000;Access control:250000;Full home system:400000
Bodyguard|60000|start|Per day:60000;Per week:300000;Event cover:100000;Executive protection, monthly:900000
Alarm system installer|50000|start|Basic alarm:50000;Wireless alarm:90000;Alarm with CCTV:150000;Alarm maintenance:20000
Safe installer and repairer|20000|start|Safe installation:20000;Lock repair:15000;Combination reset:8000;Safe removal:30000

# agri
Poultry farmer|600|supply|Day-old chick:600;Point-of-lay hen:6500;Broiler, each:8000;Crate of eggs:4000
Fish farmer|3500|supply|Catfish, per kg:3500;Fingerlings, per 100:8000;Smoked fish, per kg:6000;Pond consultation:15000
Livestock farmer|70000|supply|Goat:70000;Ram:120000;Cow:900000;Consultation:10000
Farm equipment repairer|10000|arrive|Diagnosis:10000;Pump repair:20000;Sprayer repair:8000;Engine overhaul:60000
Farm consultant|20000|slot|Farm visit:20000;Soil advice:15000;Farm plan:60000;Monthly advisory:80000
Irrigation installer|100000|start|Site survey:30000;Small drip kit:100000;Sprinkler system:300000;Full farm irrigation:1500000
Tractor operator|30000|start|Ploughing, per hectare:30000;Harrowing, per hectare:25000;Ridging, per hectare:25000;Full land preparation:80000
Veterinary services|7000|arrive|Farm visit:10000;Vaccination:5000;Treatment:15000;Herd check:25000
Crop spraying services|15000|start|Spraying, per acre:15000;Pesticide application:20000;Herbicide application:18000;Full season package:120000
Farm produce delivery|6000|supply|Fresh vegetable basket:6000;Yam tubers, set of 5:8000;Basket of tomatoes:25000;Plantain bunch:5000

# daily
Errand runner|2000|deliver|Short errand:2000;Queue and pick-up:3500;Bill payments:2500;Half-day errands:10000
Personal shopper|5000|slot|Grocery shopping:5000;Gift shopping:8000;Market run:6000;Wardrobe shopping:20000
Home delivery|1500|deliver|Small item:1500;Groceries:2500;Large item:5000;Same-day express:4000
Waste disposal|5000|arrive|Weekly pick-up:5000;One-off clearance:15000;Bulky waste:25000;Monthly plan:15000
Septic tank evacuation|40000|arrive|Small tank:35000;Standard tank:50000;Large tank:80000;Emergency evacuation:90000
Borehole drilling|800000|start|Site survey:30000;Small borehole:800000;Deep borehole:1500000;Pump installation:150000
Water supply delivery|15000|arrive|Small tanker:15000;Medium tanker:25000;Large tanker:40000;Monthly supply:120000
Gas delivery|10000|deliver|3 kg refill:5000;6 kg refill:10000;12.5 kg refill:20000;New cylinder:45000
Locksmith
Babysitting|3000|slot|Per hour:3000;Evening:12000;Overnight:25000;Weekend:50000
Nanny services|60000|start|Daily nanny:8000;Live-out, monthly:60000;Live-in, monthly:90000;Weekend nanny:20000
Pet grooming|10000|slot|Bath:8000;Haircut:12000;Full groom:20000;Nail trim:3000
Pet sitting|5000|slot|Per visit:5000;Per day:12000;Overnight:20000;Week of care:70000
Shoe shining|500|wait|Quick shine:500;Leather polish:1000;Boot shine:1500;Pickup and shine:3000
House sitting|10000|start|Per night:10000;Weekend:25000;Per week:60000;Per month:200000
`;

const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const SERVICES=[];
(function(){
  let g=null;
  SERVICE_TEXT.split('\n').forEach(function(line){
    line=line.trim();
    if(!line)return;
    if(line.charAt(0)==='#'){g=line.slice(1).trim();return;}
    const f=line.split('|'),name=f[0].trim(),id=slug(name);
    let s=SERVICES.find(x=>x.id===id);
    if(s){if(s.groups.indexOf(g)<0)s.groups.push(g);return;}
    const cu=CUSTOM[id]||{},gr=GROUP(g);
    s={id:id,name:name,groups:[g],base:+f[1],kind:f[2],h24:f[4]==='24',itemNames:[],itemPrices:[],
       label:cu.label||SPEED[f[2]].label,scores:cu.scores||gr.scores,note:cu.note||gr.note};
    f[3].split(';').forEach(function(it){
      const k=it.lastIndexOf(':');
      if(k>0&&/^\d+$/.test(it.slice(k+1))){s.itemNames.push(it.slice(0,k));s.itemPrices.push(+it.slice(k+1));}
      else{s.itemNames.push(it);s.itemPrices.push(null);}
    });
    SERVICES.push(s);
  });
})();

/* Providers written by hand. They are listed under the id of their service. */
const HAND=[
/* Tailors */
{id:'mt',c:'tailor',name:'Mama Tope Fashion House',ini:'MT',area:'Allen Avenue, Ikeja',km:0.6,rating:4.8,reviews:212,sp:[7200,'5 days'],onTime:94,open:true,hours:'Closes 7:00 pm',perk:['Express 48 hrs','Express 48 hrs, +30%'],spec:'Ankara, aso-ebi, gowns',years:12,fabric:'Bring your own, or buy in the shop',scores:[4.9,4.8,4.6,4.7],
 services:[['Ankara gown',15000],['Ankara two-piece',18000],['Blouse and wrapper',14000],['Aso-ebi set, per person',12000],['Kids outfit',8000]],
 revs:[['Bisi O.',5,'Gown fit on the first fitting. Ready the day she promised.','2 weeks ago'],['Chinedu A.',4,'Neat stitching. Very busy in December, so book early.','1 month ago']]},
{id:'sc',c:'tailor',name:'Sharp Cut Menswear',ini:'SC',area:'Opebi Road, Ikeja',km:1.1,rating:4.6,reviews:148,sp:[10080,'7 days'],onTime:88,open:true,hours:'Closes 6:30 pm',perk:['Express 72 hrs','Express 72 hrs, +25%'],spec:'Suits, senator wear, agbada',years:9,fabric:'Bring your own',scores:[4.7,4.6,4.2,4.5],
 services:[['Shirt',9000],['Trousers',12000],['Senator two-piece',25000],['Agbada three-piece',45000],['Two-piece suit',65000]],
 revs:[['Tunde K.',5,'Senator set sat well across the shoulders. Collected on the agreed day.','3 weeks ago'],['Emeka P.',4,'Good suit, but the trousers needed one adjustment.','2 months ago']]},
{id:'fs',c:'tailor',name:"Folake's Stitch Studio",ini:'FS',area:'Maryland, Ikeja',km:1.9,rating:4.9,reviews:96,sp:[14400,'10 days'],onTime:97,open:false,hours:'Opens 10:00 am',perk:null,spec:'Wedding gowns, aso-oke, bridal party',years:7,fabric:'Bring your own, or ask for sourcing (extra)',scores:[4.9,4.9,4.8,4.6],
 services:[['Bridesmaid dress',20000],['Aso-oke set',35000],['Corset bodice',45000],['Reception gown',60000],['Wedding gown, custom',180000]],
 revs:[['Amaka N.',5,'Three fittings, each one better. Worth the wait for my wedding gown.','1 month ago'],['Yetunde S.',5,'Bridesmaid dresses all matched. She finished two days early.','2 months ago']]},
{id:'qf',c:'tailor',name:'Quick Fix Alterations',ini:'QF',area:'Obafemi Awolowo Way, Ikeja',km:0.9,rating:4.3,reviews:301,sp:[480,'Same day'],onTime:91,open:true,hours:'Closes 8:00 pm',perk:['Express 3 hrs','Express 3 hrs, +50%'],spec:'Hems, zips, resizing',years:5,fabric:'Not needed',scores:[4.4,4.2,4.6,4.8],
 services:[['Trouser hem',1500],['Zip replacement',2000],['Waist take in or let out',3000],['Sleeve shorten',3500],['Resize a dress',6000]],
 revs:[['Ifeanyi B.',5,'Hemmed two trousers while I ran an errand.','5 days ago'],['Hauwa M.',3,'Quick, but the queue is long around lunch.','3 weeks ago']]},
/* Barbers */
{id:'b1',c:'barber',name:'Cut Above Barbers',ini:'CA',area:'Toyin Street, Ikeja',km:0.4,rating:4.7,reviews:264,sp:[15,'15 min'],onTime:93,open:true,hours:'Closes 9:00 pm',perk:null,spec:'Fades, low cuts, beard shaping',years:8,
 scores:[4.8,4.7,4.5,4.7],services:[['Line-up only',1500],['Kids cut',2000],['Haircut',2500],['Haircut and beard',3500],['Hair dye',6000]],
 revs:[['Kayode M.',5,'Clean fade and no long wait. Booked a slot and started on time.','4 days ago'],['Ahmed S.',4,'Great beard shaping. Parking is tight on weekends.','3 weeks ago']]},
{id:'b2',c:'barber',name:'Royal Clippers',ini:'RC',area:'Oregun Road',km:1.6,rating:4.5,reviews:118,sp:[30,'30 min'],onTime:87,open:true,hours:'Closes 8:30 pm',perk:null,spec:'Classic cuts, hair treatment',years:4,
 scores:[4.6,4.5,4.2,4.6],services:[['Kids cut',1500],['Haircut',2000],['Haircut and beard',3000],['Hair treatment',5000]],
 revs:[['Victor E.',4,'Good classic cut for a fair price.','2 weeks ago'],['Tobi A.',4,'Shop was busy but moved fast.','1 month ago']]},
{id:'b3',c:'barber',name:'Gents Lounge by Dayo',ini:'GL',area:'Adeniyi Street, Maryland',km:2.3,rating:4.8,reviews:77,sp:[45,'45 min'],onTime:90,open:false,hours:'Opens 9:00 am',perk:null,spec:'Premium cuts, hot towel shave',years:6,
 scores:[4.9,4.9,4.4,4.5],services:[['Kids cut',3000],['Haircut',4000],['Facial',5000],['Haircut and beard',6000]],
 revs:[['Femi D.',5,'Hot towel shave was worth the extra wait.','3 weeks ago'],['Chuka O.',5,'Best fade I have had in months.','1 month ago']]},
/* Mechanics */
{id:'m1',c:'mechanic',name:'AutoCare Hub',ini:'AH',area:'Awolowo Way, Ikeja',km:1.3,rating:4.6,reviews:183,sp:[120,'2 hrs'],onTime:89,open:true,hours:'Closes 6:00 pm',perk:null,spec:'General repairs, AC, brakes',years:10,
 scores:[4.7,4.6,4.4,4.6],services:[['Diagnostic scan',5000],['Oil and filter change',8000],['Brake pad replacement',15000],['AC gas refill',18000],['Full service',35000]],
 revs:[['Rotimi A.',5,'Told me the brake pads were fine and only charged for the scan.','2 weeks ago'],['Joy N.',4,'AC gas refill done the same afternoon.','1 month ago']]},
{id:'m2',c:'mechanic',name:'Mathias Auto Electric',ini:'MA',area:'Ogba, Ikeja',km:3.1,rating:4.4,reviews:92,sp:[240,'4 hrs'],onTime:82,open:true,hours:'Closes 7:00 pm',perk:null,spec:'Auto electrical, batteries',years:14,
 scores:[4.5,4.4,4.1,4.5],services:[['Battery check and fit',3000],['Diagnostic scan',4000],['Wiring fault',12000],['Starter motor repair',18000],['Alternator repair',20000]],
 revs:[['Sule B.',4,'Found a wiring fault two other garages missed.','3 weeks ago'],['Ebuka C.',4,'Honest about what needed replacing. Slow on a busy day.','2 months ago']]},
{id:'m3',c:'mechanic',name:'Roadside Rescue Garage',ini:'RR',area:'Oshodi',km:4.5,rating:4.7,reviews:141,sp:[60,'1 hr'],onTime:92,open:true,hours:'Open 24 hours',perk:['24/7 callout','24/7 roadside callout, +₦10,000'],spec:'Roadside help, towing, tyres',years:7,
 scores:[4.7,4.8,4.7,4.4],services:[['Tyre change or repair',4000],['Jump start',5000],['Diagnostic scan',6000],['Oil and filter change',9000],['Tow within 5 km',15000]],
 revs:[['Dami F.',5,'Reached me on the expressway in under an hour at night.','1 week ago'],['Kunle H.',4,'Fair towing price. Tyre repair was quick.','1 month ago']]},
/* Electricians */
{id:'e1',c:'electrician',name:'Brightwire Electricals',ini:'BE',area:'Opebi, Ikeja',km:0.7,rating:4.7,reviews:121,sp:[45,'45 min'],onTime:94,open:true,hours:'Closes 7:00 pm',perk:['Emergency 24/7','Emergency call-out 24/7, +₦5,000'],spec:'Wiring, inverters, fault finding',years:11,
 scores:[4.8,4.8,4.6,4.6],services:[['Socket or switch fit',3500],['Call-out and inspection',5000],['Ceiling fan install',8000],['Inverter wiring',45000],['Full rewire, per room',60000]],
 revs:[['Ngozi P.',5,'Traced a tripping breaker in one visit. Left the area clean.','2 weeks ago'],['Tayo R.',5,'Arrived within the hour for an evening fault.','1 month ago']]},
{id:'e2',c:'electrician',name:'SafeVolt Services',ini:'SV',area:'Ojodu Berger',km:3.6,rating:4.3,reviews:66,sp:[120,'2 hrs'],onTime:85,open:true,hours:'Closes 6:00 pm',perk:null,spec:'Generator changeover, meters',years:5,
 scores:[4.4,4.5,4.0,4.5],services:[['Socket or switch fit',3000],['Call-out and inspection',4000],['Prepaid meter fitting',10000],['Generator changeover switch',15000],['Inverter wiring',40000]],
 revs:[['Haruna Y.',4,'Fitted the changeover switch neatly and explained the wiring.','3 weeks ago'],['Lola G.',3,'Good work, but arrived two hours after the time he gave.','2 months ago']]},
/* Plumbers */
{id:'p1',c:'plumber',name:'FlowRight Plumbing',ini:'FR',area:'Ikeja GRA',km:1.5,rating:4.6,reviews:98,sp:[60,'1 hr'],onTime:90,open:true,hours:'Closes 6:30 pm',perk:['Emergency 24/7','Emergency call-out 24/7, +₦6,000'],spec:'Leaks, toilets, water heaters',years:9,
 scores:[4.7,4.6,4.5,4.5],services:[['Call-out and inspection',5000],['Leaking tap or pipe',6000],['Toilet repair',9000],['Water heater install',15000],['Borehole pump check',20000]],
 revs:[['Ify K.',5,'Fixed a leaking pipe under the sink in under an hour.','2 weeks ago'],['Bayo T.',4,'Clear quote before starting. Clean finish.','1 month ago']]},
{id:'p2',c:'plumber',name:'Alade Pipes & Fittings',ini:'AP',area:'Agidingbi, Ikeja',km:2.4,rating:4.2,reviews:59,sp:[180,'3 hrs'],onTime:80,open:false,hours:'Opens 8:00 am',perk:null,spec:'Tanks, pipes, leaks',years:6,
 scores:[4.3,4.2,3.9,4.5],services:[['Call-out and inspection',3500],['Leaking tap or pipe',5000],['Toilet repair',8000],['Tank cleaning',18000],['Water tank install',25000]],
 revs:[['Chioma V.',4,'Tank cleaned thoroughly at a fair price.','3 weeks ago'],['Usman L.',4,'Cheaper than others I called. Took a while to arrive.','2 months ago']]},
/* Phone repair */
{id:'f1',c:'phone-repairer',name:'Screen Doctor',ini:'SD',area:'Computer Village, Ikeja',km:0.5,rating:4.5,reviews:410,sp:[60,'1 hr'],onTime:90,open:true,hours:'Closes 7:00 pm',perk:['Express 30 min','Express 30 min on screens, +₦2,000'],spec:'Screens, batteries, ports',years:8,
 scores:[4.6,4.4,4.5,4.5],services:[['Software fix',3000],['Charging port repair',6000],['Battery replacement',8000],['Water damage clean',12000],['Screen replacement',25000]],
 revs:[['Wale J.',5,'New screen in under an hour. Price matched the quote.','5 days ago'],['Sade P.',4,'Busy shop, but they kept my phone safe while I waited.','3 weeks ago']]},
{id:'f2',c:'phone-repairer',name:'FixPoint Mobile',ini:'FM',area:'Obafemi Awolowo Way, Ikeja',km:1.0,rating:4.3,reviews:207,sp:[120,'2 hrs'],onTime:86,open:true,hours:'Closes 6:00 pm',perk:null,spec:'Screens, cameras, software',years:4,
 scores:[4.4,4.2,4.2,4.6],services:[['Software fix',2500],['Charging port repair',5500],['Battery replacement',7000],['Camera repair',15000],['Screen replacement',22000]],
 revs:[['Iyabo C.',4,'Battery swapped fast. Asked for a receipt and got one.','2 weeks ago'],['Dare M.',4,'Fair price on the charging port.','1 month ago']]},
{id:'f3',c:'phone-repairer',name:'Pixel Care Lab',ini:'PC',area:'Maryland, Ikeja',km:2.7,rating:4.8,reviews:156,sp:[1440,'1 day'],onTime:95,open:true,hours:'Closes 5:30 pm',perk:null,spec:'Board-level repairs, iPhones',years:6,
 scores:[4.9,4.8,4.6,4.3],services:[['Software fix',3500],['Battery replacement',9500],['Water damage clean',15000],['Screen replacement',30000],['Motherboard repair',45000]],
 revs:[['Tomi W.',5,'Brought back an iPhone that other shops gave up on.','3 weeks ago'],['Ada Q.',5,'Took a day but the repair was spotless.','2 months ago']]},
/* Hair stylists */
{id:'h1',c:'hairdresser-hairstylist',name:'Ife Glam Studio',ini:'IG',area:'Allen Avenue, Ikeja',km:0.3,rating:4.8,reviews:189,sp:[240,'Today, 3 pm'],onTime:91,open:true,hours:'Closes 8:00 pm',perk:null,spec:'Braids, wigs, treatments',years:7,
 scores:[4.9,4.7,4.5,4.6],services:[['Wash and blow dry',4000],['Relaxer or treatment',10000],['Wig install',12000],['Braids, medium',15000],['Knotless braids',25000]],
 revs:[['Sharon B.',5,'Knotless braids neat and ready in four hours.','1 week ago'],['Bimpe T.',4,'Wig install looked natural. Shop runs a bit behind at weekends.','1 month ago']]},
{id:'h2',c:'hairdresser-hairstylist',name:'Zainab Hair Place',ini:'ZH',area:'Ogba, Ikeja',km:2.9,rating:4.5,reviews:102,sp:[1440,'Tomorrow'],onTime:88,open:true,hours:'Closes 7:00 pm',perk:null,spec:'Cornrows, natural hair',years:5,
 scores:[4.6,4.5,4.3,4.8],services:[['Wash and set',3500],['Cornrows',6000],['Natural hair treatment',8000],['Wig install',10000],['Braids, medium',12000]],
 revs:[['Nneka O.',5,'Cornrows tight and even without hurting.','2 weeks ago'],['Fatima S.',4,'Good natural hair treatment. Booked a day ahead.','1 month ago']]},
{id:'h3',c:'hairdresser-hairstylist',name:'Luxe Locks by Ada',ini:'LL',area:'Gbagada Phase 2',km:4.4,rating:4.9,reviews:64,sp:[2880,'In 2 days'],onTime:97,open:false,hours:'Opens 10:00 am',perk:null,spec:'Silk press, colour, wigs',years:4,
 scores:[5.0,4.9,4.8,4.4],services:[['Wash and blow dry',5000],['Silk press',15000],['Wig install',18000],['Colour and treatment',30000],['Knotless braids',35000]],
 revs:[['Blessing U.',5,'Silk press lasted three weeks. Worth the trip.','1 month ago'],['Tosin H.',5,'Colour came out exactly as discussed.','2 months ago']]}
];

/* ---------- Generated sample providers ----------
   Every service without hand-written providers gets 3 or 4 made-up ones. The generator is
   seeded by the service id, so the same service always shows the same providers. */
const OWNERS=['Tope','Ngozi','Chidi','Bola','Femi','Aisha','Emeka','Kemi','Yusuf','Ada','Segun','Zainab','Tunde','Ifeoma','Musa','Dayo','Sade','Obi','Folake','Ibrahim','Amaka','Kunle','Halima','Bayo','Chioma','Wale','Jide','Nkechi','Sola','Hauwa'];
const ADJ=['Prime','Bright','Golden','Royal','Swift','Trusty','Classic','Elite','Smart','Ideal','Grace','Pinnacle','Evergreen','Mainland','Premier','Alpha','Zenith','Crown','Sure','Noble'];
const AREAS=['Allen Avenue, Ikeja','Opebi, Ikeja','Maryland, Ikeja','Ogba, Ikeja','Oregun, Ikeja','Ojodu Berger','Agidingbi, Ikeja','Ikeja GRA','Oshodi','Gbagada Phase 1','Alausa, Ikeja','Ilupeju','Computer Village, Ikeja','Awolowo Way, Ikeja','Anthony Village','Ojota','Isheri','Magodo Phase 2'];
const REV5=['Did exactly what was promised and on time.','Professional, polite and a fair price. I will book again.','Explained the price before starting. No surprises at the end.','Neat work and clear communication from start to finish.'];
const REV4=['Good work. It took a little longer than I expected.','Fair price and decent service. Book early because they get busy.','Solid job overall. Small delay, but they called to say so.'];
const REVERS=['Bisi O.','Chinedu A.','Tunde K.','Amaka N.','Kayode M.','Ifeanyi B.','Hauwa M.','Ngozi E.','Segun A.','Kemi D.','Wale J.','Sade P.','Emeka P.','Yetunde S.','Musa I.','Tobi A.','Dami F.','Ify K.'];
const WHEN=['3 days ago','1 week ago','2 weeks ago','3 weeks ago','1 month ago','2 months ago'];
const MULT=[1,1.6,2.5,4];

function rng(seed){
  let h=1779033703^seed.length;
  for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=(h<<13)|(h>>>19);}
  return function(){
    h=Math.imul(h^(h>>>16),2246822507);
    h=Math.imul(h^(h>>>13),3266489909);
    h^=h>>>16;
    return (h>>>0)/4294967296;
  };
}
const pick=(r,a)=>a[Math.floor(r()*a.length)];
const roundP=n=>n<1000?Math.round(n/10)*10:n<10000?Math.round(n/100)*100:n<100000?Math.round(n/500)*500:Math.round(n/5000)*5000;

function makeProviders(s){
  const r=rng(s.id),g=GROUP(s.groups[0]);
  const n=3+(r()<0.35?1:0),out=[],used={};
  for(let i=0;i<n;i++){
    let name,ini;
    do{
      const owner=pick(r,OWNERS),adj=pick(r,ADJ),noun=pick(r,g.nouns);
      name=r()<0.5?owner+"'s "+noun:adj+' '+noun;
      ini=name.replace(/[^A-Za-z ]/g,'').split(' ').filter(Boolean).slice(0,2).map(w=>w.charAt(0)).join('').toUpperCase();
    }while(used[name]||used['i:'+ini]);
    used[name]=1;used['i:'+ini]=1;
    const rating=+(4+r()*0.9).toFixed(1);
    const km=i===0?+(0.3+r()*1.1).toFixed(1):+(0.4+r()*4.5).toFixed(1);
    const open=s.h24||r()<0.82;
    const sp=pick(r,SPEED[s.kind].opts);
    const f=0.8+r()*0.5;
    const services=s.itemNames.map((nm,k)=>[nm,roundP((s.itemPrices[k]!==null?s.itemPrices[k]:s.base*MULT[k])*f)]);
    const scores=s.scores.map(()=>+Math.min(5,Math.max(3.8,rating+(r()-0.5)*0.6)).toFixed(1));
    const w1=pick(r,REVERS);let w2=pick(r,REVERS);if(w2===w1)w2='Ayo T.';
    const r2=r()<0.5?5:4;
    const revs=[
      [w1,rating>=4.5?5:4,pick(r,rating>=4.5?REV5:REV4),pick(r,WHEN)],
      [w2,r2,pick(r,r2===5?REV5:REV4),pick(r,WHEN)]
    ];
    out.push({
      id:s.id+'-'+(i+1),c:s.id,name:name,ini:ini,area:pick(r,AREAS),km:km,rating:rating,
      reviews:Math.round(25+r()*350),sp:sp,onTime:Math.round(78+r()*20),open:open,
      hours:s.h24?'Open 24 hours':open?'Closes '+pick(r,['5:00 pm','6:00 pm','7:00 pm','8:00 pm']):'Opens '+pick(r,['8:00 am','9:00 am','10:00 am']),
      perk:s.h24?['24/7','Open 24 hours, every day']:(r()<0.5?g.perk:null),
      spec:s.itemNames.slice(0,3).join(' · '),years:2+Math.floor(r()*16),scores:scores,services:services,revs:revs
    });
  }
  return out;
}

const PROVIDERS=HAND.slice();
(function(){
  const have={};
  HAND.forEach(p=>{have[p.c]=true;});
  SERVICES.forEach(s=>{if(!have[s.id])makeProviders(s).forEach(p=>PROVIDERS.push(p));});
  PROVIDERS.forEach(t=>{t.from=Math.min.apply(null,t.services.map(x=>x[1]));});
})();
