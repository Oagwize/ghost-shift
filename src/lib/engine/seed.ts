import type {
  Appointment,
  BuyingCue,
  CallRecord,
  Contact,
  Draft,
  Enquiry,
  HoursEntry,
  Invoice,
  Job,
  Measurement,
  Membership,
  Payment,
  Person,
  Quote,
  Shop,
  Signal,
} from "./types";
import { isoDaysAgo, isoMinutesAgo } from "./ids";
import { CATALOG } from "./catalog";
export const RIVERSIDE = "shop_riverside";
export const HARBOR = "shop_harbor";
export const shops: Shop[] = [{
	id: RIVERSIDE,
	name: "Northline Supply",
	city: "Harrisburg, PA",
	reps: 5,
	system: "CSV",
	status: "live",
	ownerName: "Mike Chen",
	staffName: "Dana Ruiz",
	staffRole: "Account executive",
	monthlyFee: 2500,
	products: CATALOG.filter((p) => !p.readOnly).map((p) => p.id),
	connector: {
		kind: "csv",
		lastSync: isoDaysAgo(0),
		health: "ok"
	},
	sendEnabled: false,
	killed: false,
	killedReason: null,
	baselineAt: isoDaysAgo(12)
}, {
	id: HARBOR,
	name: "Meridian Instruments",
	city: "Erie, PA",
	reps: 4,
	system: "HubSpot",
	status: "onboarding",
	ownerName: "Priya Shah",
	staffName: "Luis Ortega",
	staffRole: "Account executive",
	monthlyFee: 1500,
	products: [],
	connector: {
		kind: "hubspot",
		lastSync: null,
		health: "not_connected"
	},
	sendEnabled: false,
	killed: false,
	killedReason: null,
	baselineAt: null
}];
export const people: Person[] = [
	{
		id: "p_mike",
		shopId: RIVERSIDE,
		name: "Mike Chen",
		role: "owner"
	},
	{
		id: "p_dana",
		shopId: RIVERSIDE,
		name: "Dana Ruiz",
		role: "desk"
	},
	{
		id: "p_priya",
		shopId: HARBOR,
		name: "Priya Shah",
		role: "owner"
	},
	{
		id: "p_luis",
		shopId: HARBOR,
		name: "Luis Ortega",
		role: "desk"
	}
];
export const jobs: Job[] = [
	{
		id: "job_1",
		shopId: RIVERSIDE,
		customer: "Westfield Plants",
		vehicle: "Plant 2, facilities",
		ro: "OPP-44118",
		recommended: "VFD retrofit on AHU-3",
		amount: 6400,
		declinedOn: isoDaysAgo(46),
		lastOutbound: null,
		stillValid: true
	},
	{
		id: "job_2",
		shopId: RIVERSIDE,
		customer: "Pike County Schools",
		vehicle: "Campus operations",
		ro: "OPP-44002",
		recommended: "Building automation phase 2",
		amount: 8900,
		declinedOn: isoDaysAgo(71),
		lastOutbound: null,
		stillValid: true
	},
	{
		id: "job_3",
		shopId: RIVERSIDE,
		customer: "Nora Patel",
		vehicle: "Distribution, Midwest",
		ro: "OPP-43891",
		recommended: "Spare controls kit for line 4",
		amount: 1420,
		declinedOn: isoDaysAgo(28),
		lastOutbound: isoDaysAgo(27),
		stillValid: true
	},
	{
		id: "job_4",
		shopId: RIVERSIDE,
		customer: "Chris Nguyen",
		vehicle: "Field service",
		ro: "OPP-43770",
		recommended: "Handheld calibrators, set of six",
		amount: 980,
		declinedOn: isoDaysAgo(94),
		lastOutbound: null,
		stillValid: true
	},
	{
		id: "job_5",
		shopId: RIVERSIDE,
		customer: "Marisol Diaz",
		vehicle: "Lab services",
		ro: "OPP-43612",
		recommended: "Bench meter and training day",
		amount: 760,
		declinedOn: isoDaysAgo(19),
		lastOutbound: null,
		stillValid: true
	},
	{
		id: "job_6",
		shopId: RIVERSIDE,
		customer: "Owen Blake",
		vehicle: "Plant 1",
		ro: "OPP-43501",
		recommended: "Panel upgrade, west wing",
		amount: 11800,
		declinedOn: isoDaysAgo(120),
		lastOutbound: isoDaysAgo(5),
		stillValid: true
	},
	{
		id: "job_7",
		shopId: RIVERSIDE,
		customer: "Aisha Rahman",
		vehicle: "Procurement",
		ro: "OPP-43440",
		recommended: "Annual calibration contract",
		amount: 1400,
		declinedOn: isoDaysAgo(33),
		lastOutbound: null,
		stillValid: true
	},
	{
		id: "job_8",
		shopId: RIVERSIDE,
		customer: "Tom Ellison",
		vehicle: "Maintenance",
		ro: "OPP-43308",
		recommended: "Ultrasonic leak survey",
		amount: 540,
		declinedOn: isoDaysAgo(58),
		lastOutbound: null,
		stillValid: true
	},
	{
		id: "job_9",
		shopId: RIVERSIDE,
		customer: "Lena Orth",
		vehicle: "Quality",
		ro: "OPP-43220",
		recommended: "Closed-loop training",
		amount: 210,
		declinedOn: isoDaysAgo(4),
		lastOutbound: null,
		stillValid: false,
		completed: true,
		reviewRequested: false
	},
	{
		id: "job_10",
		shopId: RIVERSIDE,
		customer: "Marcus Bell",
		vehicle: "Operations",
		ro: "OPP-43110",
		recommended: "Sensor swap, line 2",
		amount: 175,
		declinedOn: isoDaysAgo(8),
		lastOutbound: null,
		stillValid: false,
		completed: true,
		reviewRequested: false
	}
];
export const quotes: Quote[] = [{
	id: "q_1",
	shopId: RIVERSIDE,
	customer: "Greenfield Realty",
	vehicle: "Three properties",
	summary: "Controls package for the new wing",
	amount: 21e3,
	sentOn: isoDaysAgo(18),
	lastOutbound: isoDaysAgo(18),
	open: true
}, {
	id: "q_2",
	shopId: RIVERSIDE,
	customer: "Helen Cho",
	vehicle: "Plant engineering",
	summary: "Compressor controls replacement",
	amount: 12600,
	sentOn: isoDaysAgo(41),
	lastOutbound: null,
	open: true
}];
export const invoices: Invoice[] = [
	{
		id: "inv_1",
		shopId: RIVERSIDE,
		customer: "Piedmont Delivery",
		number: "INV-2091",
		amount: 1840,
		dueOn: isoDaysAgo(37),
		agingDays: 37
	},
	{
		id: "inv_2",
		shopId: RIVERSIDE,
		customer: "Samir Haddad",
		number: "INV-2114",
		amount: 420,
		dueOn: isoDaysAgo(16),
		agingDays: 16
	},
	{
		id: "inv_3",
		shopId: RIVERSIDE,
		customer: "Kline Property Mgmt",
		number: "INV-2077",
		amount: 960,
		dueOn: isoDaysAgo(64),
		agingDays: 64
	}
];
export const payments: Payment[] = [{
	id: "pay_1",
	shopId: RIVERSIDE,
	customer: "Diane Copeland",
	amount: 890,
	failedOn: isoDaysAgo(6),
	reason: "expired_card",
	retried: false
}, {
	id: "pay_2",
	shopId: RIVERSIDE,
	customer: "Northside Fabrication",
	amount: 2400,
	failedOn: isoDaysAgo(11),
	reason: "nsf",
	retried: false
}];
export const appointments: Appointment[] = [
	{
		id: "ap_1",
		shopId: RIVERSIDE,
		customer: "Ruth Alvarez",
		vehicle: "Discovery call",
		completedOn: isoDaysAgo(5),
		nextOn: null,
		ticket: 4200
	},
	{
		id: "ap_2",
		shopId: RIVERSIDE,
		customer: "Ben Ito",
		vehicle: "Site walk",
		completedOn: isoDaysAgo(9),
		nextOn: null,
		ticket: 6800
	},
	{
		id: "ap_3",
		shopId: RIVERSIDE,
		customer: "Carla Jensen",
		vehicle: "Quarterly review",
		completedOn: isoDaysAgo(3),
		nextOn: isoDaysAgo(-40),
		ticket: 2100
	}
];
export const contacts: Contact[] = [{
	id: "ct_1",
	shopId: RIVERSIDE,
	customer: "Thea Brooks",
	lastVisit: isoDaysAgo(210),
	expectedDays: 90,
	averageTicket: 5400
}, {
	id: "ct_2",
	shopId: RIVERSIDE,
	customer: "Ian McCabe",
	lastVisit: isoDaysAgo(280),
	expectedDays: 120,
	averageTicket: 3900
}];
export const memberships: Membership[] = [{
	id: "mem_1",
	shopId: RIVERSIDE,
	customer: "Holly Grant",
	plan: "Calibration retainer",
	renewsOn: isoDaysAgo(-12),
	confirmed: false,
	monthly: 290
}];
export const cues: BuyingCue[] = [
	{
		id: "cue_1",
		shopId: RIVERSIDE,
		company: "Westfield ISD",
		reason: "Posted a bid for building automation on three campuses",
		source: "PennBid, 4 days ago",
		dated: isoDaysAgo(4),
		amount: 42e3,
		routed: false
	},
	{
		id: "cue_2",
		shopId: RIVERSIDE,
		company: "Pike River Logistics",
		reason: "Opened a second warehouse in Mechanicsburg",
		source: "County permit board, 8 days ago",
		dated: isoDaysAgo(8),
		amount: 18500,
		routed: false
	},
	{
		id: "cue_3",
		shopId: RIVERSIDE,
		company: "Cedar Ridge Foods",
		reason: "Hired a VP of Operations out of Nestle",
		source: "LinkedIn, 2 days ago",
		dated: isoDaysAgo(2),
		amount: 12e3,
		routed: false
	},
	{
		id: "cue_4",
		shopId: RIVERSIDE,
		company: "Harrisburg Housing Authority",
		reason: "Capital plan names HVAC controls for 2026",
		source: "Board minutes, 11 days ago",
		dated: isoDaysAgo(11),
		amount: 31e3,
		routed: false
	},
	{
		id: "cue_5",
		shopId: RIVERSIDE,
		company: "Meridian Labs",
		reason: "Won a state lab-expansion grant",
		source: "Press release, 6 days ago",
		dated: isoDaysAgo(6),
		amount: 9600,
		routed: false
	}
];
export const calls: CallRecord[] = [
	{
		id: "call_1",
		shopId: RIVERSIDE,
		from: "717-555-0144",
		at: isoDaysAgo(1),
		answered: false,
		askedForBooking: false,
		booked: false,
		estimated: 2800,
		ownerName: "Dana Ruiz",
		company: "Westfield ISD"
	},
	{
		id: "call_2",
		shopId: RIVERSIDE,
		from: "717-555-0190",
		at: isoDaysAgo(1),
		answered: false,
		askedForBooking: false,
		booked: false,
		estimated: 2800,
		ownerName: "Dana Ruiz",
		company: "Riverside Prep"
	},
	{
		id: "call_3",
		shopId: RIVERSIDE,
		from: "717-555-0112",
		at: isoDaysAgo(2),
		answered: true,
		askedForBooking: false,
		booked: false,
		estimated: 2800,
		ownerName: "Dana Ruiz"
	},
	{
		id: "call_4",
		shopId: RIVERSIDE,
		from: "717-555-0166",
		at: isoDaysAgo(3),
		answered: true,
		askedForBooking: true,
		booked: true,
		estimated: 2800,
		ownerName: "Dana Ruiz"
	},
	{
		id: "call_5",
		shopId: RIVERSIDE,
		from: "717-555-0188",
		at: isoDaysAgo(4),
		answered: true,
		askedForBooking: false,
		booked: false,
		estimated: 2800,
		ownerName: "Mike Chen"
	}

	,
	{
		id: "call_6",
		shopId: RIVERSIDE,
		from: "717-555-0122",
		at: isoDaysAgo(2),
		answered: false,
		askedForBooking: false,
		booked: false,
		estimated: 4100,
		ownerName: "Mike Chen",
		company: "Harrisburg Housing Authority"
	},
	{
		id: "call_7",
		shopId: RIVERSIDE,
		from: "717-555-0133",
		at: isoDaysAgo(5),
		answered: false,
		askedForBooking: false,
		booked: false,
		estimated: 1900,
		ownerName: "Unassigned"
	},
	{
		id: "call_8",
		shopId: RIVERSIDE,
		from: "717-555-0148",
		at: isoDaysAgo(6),
		answered: true,
		askedForBooking: false,
		booked: false,
		estimated: 3400,
		ownerName: "Dana Ruiz"
	}
];
export const enquiries: Enquiry[] = [
	{
		id: "enq_1",
		shopId: RIVERSIDE,
		kind: "form",
		name: "Avery Cole",
		company: "Capital Region Schools",
		email: "avery.cole@crs.k12.pa.us",
		message: "Need a quote on building automation for two campuses",
		at: isoMinutesAgo(42),
		repliedAt: null,
		ownerName: "Dana Ruiz",
		estimated: 12400
	},
	{
		id: "enq_2",
		shopId: RIVERSIDE,
		kind: "chat",
		name: "Sam Okonkwo",
		company: "Plant 4",
		email: "sam.okonkwo@plant4.example",
		message: "Do you still stock the spare VFD kit we used last year",
		at: isoMinutesAgo(18),
		repliedAt: null,
		ownerName: "Dana Ruiz",
		estimated: 3800
	},
	{
		id: "enq_3",
		shopId: RIVERSIDE,
		kind: "form",
		name: "Jordan Lee",
		company: "Lab services",
		email: "jordan.lee@labservices.example",
		message: "Following up on the calibration contract we discussed",
		at: isoMinutesAgo(120),
		repliedAt: isoMinutesAgo(90),
		ownerName: "Dana Ruiz",
		estimated: 16000
	},
	{
		id: "enq_4",
		shopId: RIVERSIDE,
		kind: "chat",
		name: "Riley Brooks",
		company: "Facilities",
		email: "riley.brooks@facilities.example",
		message: "Is someone at the desk",
		at: isoMinutesAgo(2),
		repliedAt: null,
		ownerName: "Dana Ruiz",
		estimated: 2100
	},
	{
		id: "enq_5",
		shopId: RIVERSIDE,
		kind: "form",
		name: "Chris Nguyen",
		company: "Cumberland Water",
		email: "c.nguyen@cumberlandwater.example",
		message: "Need a lead time on the flow meter replacement for plant 2",
		at: isoMinutesAgo(180),
		repliedAt: null,
		ownerName: "Mike Chen",
		estimated: 8900
	}
];
export const harborJobs: Job[] = [
	{
		id: "hjob_1",
		shopId: HARBOR,
		customer: "Erie Water Authority",
		vehicle: "Treatment plant",
		ro: "OPP-1022",
		recommended: "Flow meter replacement, four lines",
		amount: 7200,
		declinedOn: isoDaysAgo(38),
		lastOutbound: null,
		stillValid: true
	},
	{
		id: "hjob_2",
		shopId: HARBOR,
		customer: "Mira Solano",
		vehicle: "Quality lab",
		ro: "OPP-1008",
		recommended: "Benchtop analyzer and install",
		amount: 5100,
		declinedOn: isoDaysAgo(54),
		lastOutbound: null,
		stillValid: true
	},
	{
		id: "hjob_3",
		shopId: HARBOR,
		customer: "Cody Hart",
		vehicle: "Maintenance",
		ro: "OPP-988",
		recommended: "Calibration contract, 24 months",
		amount: 8600,
		declinedOn: isoDaysAgo(21),
		lastOutbound: null,
		stillValid: true
	}
];
export const harborQuotes: Quote[] = [{
	id: "hq_1",
	shopId: HARBOR,
	customer: "Erie School District",
	vehicle: "Facilities",
	summary: "Science-lab instrumentation package",
	amount: 18400,
	sentOn: isoDaysAgo(22),
	lastOutbound: null,
	open: true
}];
export const harborInvoices: Invoice[] = [{
	id: "hinv_1",
	shopId: HARBOR,
	customer: "Lakeside Fabrication",
	number: "MI-INV-441",
	amount: 1320,
	dueOn: isoDaysAgo(29),
	agingDays: 29
}];
export const harborPayments: Payment[] = [];
export const harborAppointments: Appointment[] = [{
	id: "hap_1",
	shopId: HARBOR,
	customer: "Nina Vogt",
	vehicle: "Intro call",
	completedOn: isoDaysAgo(6),
	nextOn: null,
	ticket: 2450
}];
export const harborContacts: Contact[] = [{
	id: "hct_1",
	shopId: HARBOR,
	customer: "Paul Rimes",
	lastVisit: isoDaysAgo(240),
	expectedDays: 90,
	averageTicket: 4100
}];
export const harborMemberships: Membership[] = [];
export const harborCues: BuyingCue[] = [{
	id: "hcue_1",
	shopId: HARBOR,
	company: "Presque Isle Foods",
	reason: "Filed for a cold-storage expansion",
	source: "County permits, 5 days ago",
	dated: isoDaysAgo(5),
	amount: 15e3,
	routed: false
}];
export const harborCalls: CallRecord[] = [{
	id: "hcall_1",
	shopId: HARBOR,
	from: "814-555-0101",
	at: isoDaysAgo(1),
	answered: false,
	askedForBooking: false,
	booked: false,
	estimated: 2200,
		ownerName: "Luis Ortega",
		company: "Presque Isle Foods"
}
	,
	{
		id: "hcall_2",
		shopId: HARBOR,
		from: "814-555-0160",
		at: isoDaysAgo(2),
		answered: false,
		askedForBooking: false,
		booked: false,
		estimated: 3100,
		ownerName: "Priya Shah",
		company: "Erie Water Authority"
	},
	{
		id: "hcall_3",
		shopId: HARBOR,
		from: "814-555-0188",
		at: isoDaysAgo(3),
		answered: true,
		askedForBooking: false,
		booked: false,
		estimated: 2400,
		ownerName: "Luis Ortega"
	}
];
export const harborEnquiries: Enquiry[] = [
	{
		id: "henq_1",
		shopId: HARBOR,
		kind: "form",
		name: "Pat Okonkwo",
		company: "Presque Isle Foods",
		email: "pat@pifoods.example",
		message: "Who should I talk to about cold storage controls",
		at: isoMinutesAgo(55),
		repliedAt: null,
		ownerName: "Luis Ortega",
		estimated: 15000
	},
	{
		id: "henq_2",
		shopId: HARBOR,
		kind: "chat",
		name: "Alex Rivera",
		company: "Erie Water Authority",
		email: "a.rivera@ewa.example",
		message: "Is the flow meter quote still open",
		at: isoMinutesAgo(3),
		repliedAt: null,
		ownerName: "Luis Ortega",
		estimated: 7200
	}
];
export const baseline: Measurement = {
	id: "m_base_riverside",
	shopId: RIVERSIDE,
	at: isoDaysAgo(12),
	method: 1,
	declinedUnfollowed: 18280,
	agingOpen: 3220,
	recoveredAttributed: 0,
	hoursFollowUp: 6.5
};
export const seedHours: HoursEntry[] = [
	{
		id: "hr_1",
		shopId: RIVERSIDE,
		at: isoDaysAgo(12),
		minutes: 95,
		kind: "baseline snapshot"
	},
	{
		id: "hr_2",
		shopId: RIVERSIDE,
		at: isoDaysAgo(11),
		minutes: 40,
		kind: "voice profile, Dana"
	},
	{
		id: "hr_3",
		shopId: RIVERSIDE,
		at: isoDaysAgo(10),
		minutes: 55,
		kind: "CSV mapping"
	},
	{
		id: "hr_4",
		shopId: HARBOR,
		at: isoDaysAgo(4),
		minutes: 85,
		kind: "discovery interview"
	},
	{
		id: "hr_5",
		shopId: HARBOR,
		at: isoDaysAgo(2),
		minutes: 30,
		kind: "config draft"
	}
];
export function draftFor(signal: Signal, personId: string): Draft {
	const first = signal.title.split(" · ")[0] ?? "there";
	const sms = signal.detector === "call.unanswered";
	const chat = signal.detector === "enquiry.chat";
	const form = signal.detector === "enquiry.form";
	return {
		id: `draft_${signal.id}`,
		shopId: signal.shopId,
		signalId: signal.id,
		personId,
		channel: sms ? "sms" : chat ? "chat" : "email",
		subject: sms ? `Text ${signal.source}` : chat ? `Chat with ${first}` : subjectFor(signal),
		body: sms ? missedText(signal) : form || chat ? enquiryReply(signal) : bodyFor(signal, first),
		createdAt: signal.createdAt,
		expiresAt: isoDaysAgo(-7)
	};
}
function subjectFor(signal: Signal): string {
	switch (signal.detector) {
		case "account.buying_cue": return `Saw this about ${signal.title.split(" · ")[0]}`;
		case "invoice.aging": return `Past due invoice for ${signal.title.split(" · ")[0]}`;
		case "quote.unfollowed": return "The proposal is still open";
		case "payment.failed": return "A charge did not go through";
		case "appointment.no_next": return "Next step from last week";
		case "contact.lapsed": return "Something useful, no ask";
		case "membership.lapsing": return "Your retainer is up for renewal";
		case "review.absent": return "Would you mind a short note";
		case "enquiry.form": return `Your note to Northline Supply`;
		default: return `Following up on ${signal.title.split(" · ")[1] ?? "what we discussed"}`;
	}
}
function bodyFor(signal: Signal, name: string): string {
	const sign = "Dana Ruiz\nNorthline Supply";
	switch (signal.detector) {
		case "account.buying_cue": return `Hi there,\n\nThis is Dana at Northline Supply. I saw that ${name} ${cueReason(signal)}. We help operations teams with the controls and instrumentation side of that work. If a short call this week is useful, reply with a morning or afternoon.\n\n${sign}`;
		case "invoice.aging": return `Hi ${name},\n\nThis is Dana at Northline Supply. Invoice ${signal.source} is past due. The balance is ${format(signal.amount)}. If you already sent payment, reply with the confirmation and I will close it. If not, I can take a card or set a date this week.\n\n${sign}`;
		case "quote.unfollowed": return `Hi ${name},\n\nThis is Dana at Northline Supply. The proposal for ${signal.title.split(" · ")[1] ?? "the work"} is still open. Nothing has changed on our side. If you want to pick it up, reply with a time that works.\n\n${sign}`;
		case "payment.failed": return `Hi ${name},\n\nThis is Dana at Northline Supply. A charge for ${format(signal.amount)} did not go through. ${signal.evidence} Reply with a card we can use, or a date to try again, and I will take care of it.\n\n${sign}`;
		case "appointment.no_next": return `Hi ${name},\n\nThis is Dana at Northline Supply. We finished last week's conversation and I do not have a next meeting on the book. If you want one, reply with a morning or afternoon and I will hold it.\n\n${sign}`;
		case "contact.lapsed": return `Hi ${name},\n\nThis is Dana at Northline Supply. It has been a while. I am not asking for a meeting. I attached a short note on what teams in your spot have been changing this quarter. If it is useful, keep it. If not, tell me to stop.\n\n${sign}`;
		case "membership.lapsing": return `Hi ${name},\n\nThis is Dana at Northline Supply. Your calibration retainer is due to renew. If you want to keep it, reply yes and I will run the card on file. If not, no need to do anything.\n\n${sign}`;
		case "review.absent": return `Hi ${name},\n\nThis is Dana at Northline Supply. Thanks for the work last week. If it went the way it should have, a short note I can show the next buyer helps more than you would think. I will not send this unless you are happy to.\n\n${sign}`;
		default: return `Hi ${name},\n\nThis is Dana at Northline Supply. When we last spoke we recommended ${evidenceWork(signal)}. That is still worth doing. If you want to pick it up, reply here and I will put time on the calendar.\n\n${sign}`;
	}
}
function missedText(signal: Signal): string {
	const owner = signal.evidence.match(/Owner ([^.]+)/)?.[1]?.trim() ?? "";
	const first = !owner || owner === "Unassigned" ? "Dana" : owner.split(" ")[0]!;
	const who = signal.title.split(" · ")[0] ?? "";
	const known = Boolean(who) && !/^\d/.test(who);
	if (known) {
		return `Northline Supply. We missed your call. This is ${first}. If ${who} still needs a meeting this week, reply with a morning or afternoon, or call the desk.`;
	}
	return `Northline Supply. We missed your call. This is ${first}. If you still need a meeting this week, reply with a morning or afternoon, or call the desk.`;
}
function enquiryReply(signal: Signal): string {
	const owner = signal.evidence.match(/Owner ([^.]+)/)?.[1]?.trim() ?? "Dana Ruiz";
	const first = !owner || owner === "Unassigned" ? "Dana" : owner.split(" ")[0]!;
	const name = (signal.title.split(" · ")[0] ?? "there").split(" ")[0] ?? "there";
	const asked = signal.evidence.match(/Asked: (.+)\. Owner /)?.[1] ?? "your note";
	if (signal.detector === "enquiry.chat") {
		return `Hi ${name}, this is ${first} at Northline Supply. You asked: ${asked}. I can take the next step. Reply here if you want a time this week.`;
	}
	return `Hi ${name},\n\nThis is ${first} at Northline Supply. We received your form. You asked: ${asked}. I can take the next step. Reply with a morning or afternoon this week.\n\n${first === "Dana" ? "Dana Ruiz" : owner}\nNorthline Supply`;
}
function cueReason(signal: Signal): string {
	const part = signal.title.split(" · ")[1];
	return part ? part.charAt(0).toLowerCase() + part.slice(1) : "had a public reason to look at this";
}
function evidenceWork(signal: Signal): string {
	return signal.evidence.match(/Recommended: ([^.]+)/)?.[1] ?? "the expansion we noted";
}
function format(n: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0
	}).format(n);
}
