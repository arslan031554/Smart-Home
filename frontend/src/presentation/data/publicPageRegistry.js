import {
  buildingPages,
  solutionPages,
  technologyPages,
} from './deckContent.js';
import {
  CATEGORY_CONFIG,
  TAB_IDS,
  clampWords,
  getCollectionByCategory,
  getPagerState,
} from './publicPageHelpers.js';

const TAB_LABELS = {
  'how-it-works': 'How it works',
  'what-is-included': 'What is included',
  'key-benefits': 'Key benefits',
  'project-applications': 'Project applications',
};

const CATEGORY_LABELS = {
  technology: 'Technology',
  buildings: 'Buildings & Destinations',
  solutions: 'Solutions',
};


function specDetail({ detailHeading, introduction, howTitle, howBody, steps, includedTitle, includedBody, included, benefitTitle, benefitBody, benefits, applicationsTitle, applicationsBody, applications, tags, hideCta }) {
  return {
    detailHeading,
    introduction,
    tags,
    hideCta,
    tabs: {
      'how-it-works': { title: howTitle, body: howBody, steps },
      'what-is-included': { title: includedTitle, body: includedBody, bullets: included },
      'key-benefits': { title: benefitTitle, body: benefitBody, bullets: benefits },
      'project-applications': { title: applicationsTitle, body: applicationsBody, bullets: applications },
    },
  };
}

const SPEC_DETAIL_OVERRIDES = {
  technology: {
    lighting: specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'Lighting that responds to people and daylight.',
      howBody: 'Smart lighting combines scenes, dimming, presence detection and daylight regulation in one coordinated system.',
      steps: [{ title: 'Sense', description: 'Presence and daylight sensors read the conditions in each room.' }, { title: 'Decide', description: 'The controller applies the right scene, level and schedule automatically.' }, { title: 'Coordinate', description: 'Lighting works together with shading, climate and energy management.' }],
      includedTitle: 'What is included in smart lighting',
      includedBody: 'The lighting package brings together the controls and automation needed for daily comfort and efficient operation.',
      included: ['Scenes for daily routines and activity modes.', 'Dimming and switching by room, group or zone.', 'Presence detection for automatic response.', 'Daylight regulation for consistent visual comfort.'],
      benefitTitle: 'Key benefits for comfort and efficiency',
      benefitBody: 'Lighting becomes easier to use because the building reacts to people, natural light and schedules instead of relying only on manual switching.',
      benefits: ['More comfortable light levels throughout the day.', 'Lower unnecessary runtime in empty or bright spaces.', 'Clearer control from keypads, app or automated scenes.', 'Better coordination with shading, climate and energy management.'],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Smart lighting fits homes, offices, hotels, public spaces and technical areas where comfort, visibility and efficient operation need to work together.',
      applications: ['Homes: welcome, night and daily comfort scenes.', 'Offices: meeting rooms, desks and shared areas.', 'Hotels: guest-room comfort and atmosphere control.', 'Industrial or parking areas: presence-based safety lighting.'],
      tags: ['Scenes', 'Dimming', 'Presence'],
      hideCta: true,
    }),
    'climate-control': specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'Comfort by zone, efficiency across the building.',
      howBody: 'Climate control unifies heating, cooling, underfloor systems and schedules while keeping every room independently adjustable.',
      steps: [{ title: 'Measure', description: 'Room temperature, occupancy and operating mode are monitored continuously.' }, { title: 'Regulate', description: 'Heating and cooling outputs are adjusted per zone using intelligent control.' }, { title: 'Optimise', description: 'Schedules, presence and shading reduce waste without reducing comfort.' }],
      includedTitle: 'What is included in climate control',
      includedBody: 'The climate package connects room control, heating and cooling outputs, schedules and operating modes into one coordinated system.',
      included: ['Independent zoning by room or area.', 'Heating, cooling and underfloor control where supported.', 'Schedules and operating modes for daily use.', 'Presence and shading coordination for better efficiency.'],
      benefitTitle: 'Key benefits for comfort and energy use',
      benefitBody: 'Each room can remain comfortable without forcing the whole building to behave as one zone. The system keeps comfort simple for users and clearer for operators.',
      benefits: ['Room-by-room comfort control.', 'Reduced unnecessary heating or cooling.', 'Clear day, night, away and scheduled modes.', 'Better coordination with shading, ventilation and energy management.'],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Climate control fits homes, apartments, offices, hotels and public buildings where rooms need different temperatures, schedules or operating priorities.',
      applications: ['Homes: room preferences and away modes.', 'Offices: meeting rooms, open areas and after-hours schedules.', 'Hotels: guest comfort with operational visibility.', 'Public buildings: predictable comfort in scheduled spaces.'],
      tags: ['Zoning', 'Heating', 'Cooling', 'Scheduling'],
      hideCta: true,
    }),
    'multi-room-audio': specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'One audio system, independently controlled in...',
      howBody: 'Multi-room audio distributes music and media across independent zones, with simple local control and coordinated scenes.',
      steps: [{ title: 'Select', description: 'Choose a source, playlist or streaming service for each room.' }, { title: 'Group', description: 'Play independently by zone or synchronise multiple spaces.' }, { title: 'Integrate', description: 'Audio joins lighting and comfort scenes for a complete experience.' }],
      includedTitle: 'What is included in multi-room audio',
      includedBody: 'The audio package connects sources, zones, amplification, speakers and control scenes into one simple system.',
      included: ['Independent room or group audio zones.', 'Source selection and volume control.', 'Amplification and speaker integration.', 'Scene-based audio behavior.', 'Control from keypads, touch panels or mobile app.'],
      benefitTitle: 'Key benefits for atmosphere and control',
      benefitBody: 'Users can play the right sound in the right areas without managing separate devices in every room.',
      benefits: ['Different music in different rooms.', 'Synchronized playback across selected spaces.', 'Simple volume and source control.', 'Audio scenes combined with lighting and comfort settings.'],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Multi-room audio fits homes, apartments, hotels, restaurants, bars, offices and event spaces where atmosphere and simple control matter.',
      applications: ['Homes: room-by-room listening and shared scenes.', 'Restaurants and bars: atmosphere by area and time of day.', 'Hotels: lobby, restaurant and shared-space audio.', 'Event spaces: quick mode changes for different uses.'],
      tags: ['Zones', 'Sources', 'Volume', 'Scenes'],
      hideCta: true,
    }),
    'metering-cost-distribution': specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'Transparent consumption and fair cost allocation.',
      howBody: 'Metering brings electricity, water, heat and gas data into a single structure for reporting, alerts and tenant billing.',
      steps: [{ title: 'Measure', description: 'Meters collect consumption data continuously for every unit or zone.' }, { title: 'Allocate', description: 'Costs are distributed using verified readings and clear rules.' }, { title: 'Report', description: 'Dashboards, exports and alerts reveal trends, leaks and abnormal use.' }],
      includedTitle: 'What is included in metering and cost distribution',
      includedBody: 'The system combines metering data, allocation logic, reporting and alerts so consumption becomes easier to understand and manage.',
      included: ['Electricity, water, heat and gas metering where supported.', 'Tenant, unit or zone-level consumption views.', 'Verified readings for cost allocation.', 'Dashboards, exports, alerts and anomaly reporting.'],
      benefitTitle: 'Key benefits for transparency and control',
      benefitBody: 'Owners and operators can understand where resources are used, distribute costs more clearly and react faster to leaks or abnormal consumption.',
      benefits: ['Transparent consumption data for every relevant zone.', 'Fairer allocation based on measured use.', 'Earlier visibility of leaks and unusual consumption.', 'Cleaner reporting for tenants, owners and facility teams.'],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Metering and cost distribution fits condominiums, apartments, offices, commercial buildings, hospitality and mixed-use projects where consumption must be measured and reported clearly.',
      applications: ['Condominiums: apartment and common-area allocation.', 'Offices: tenant or department reporting.', 'Hotels: utility visibility by operational area.', 'Mixed-use buildings: clearer consumption by unit or zone.'],
      tags: ['Energy', 'Water', 'Heat', 'Reports'],
      hideCta: true,
    }),
    'energy-management': specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'See, optimise and control energy in real time.', howBody: 'Energy management combines live metering, solar, storage, EV charging and load control to reduce peaks and operating costs.',
      steps: [{ title: 'Monitor', description: 'Live dashboards show consumption, production and storage status.' }, { title: 'Prioritise', description: 'Critical and flexible loads are managed according to available power.' }, { title: 'Optimise', description: 'Automation shifts consumption and coordinates all connected systems.' }],
      includedTitle: 'Energy management scope', includedBody: 'Energy functions are selected according to the building systems and metering equipment available.',
      included: ['Energy monitoring and dashboards.', 'Peak reduction and load-priority rules.', 'PV, battery and EV charging coordination where supported.', 'Tariff-aware scheduling where relevant.', 'Alerts for abnormal consumption or operating states.'],
      benefitTitle: 'Better decisions from real consumption data', benefitBody: 'Energy management helps owners see where waste happens and act on it. Outcomes are tracked through measured data rather than generic promises.',
      benefits: ['Clearer utility visibility.', 'Reduced peak stress where load control is installed.', 'Smarter use of solar, storage and EV charging.', 'More disciplined schedules and operating modes.'],
      applicationsTitle: 'Where energy management fits', applicationsBody: 'Energy management supports homes, offices, hotels, condominiums, factories, warehouses, parking facilities and sites with solar, storage or EV charging needs.',
      applications: ['Residential: solar, storage and comfort coordination.', 'Commercial: dashboards and schedule discipline.', 'Industrial: peak visibility and load priorities.', 'Parking: EV charging and site consumption awareness.'],
    }),
    'access-control': specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'Secure access built around people, roles and time.', howBody: 'Access control manages who can enter, where and when, while coordinating doors, lifts, alarms and building status.',
      steps: [{ title: 'Authenticate', description: 'Cards, PIN codes, mobile credentials or biometrics identify each user.' }, { title: 'Authorise', description: 'Permissions define the doors, areas and schedules available to that user.' }, { title: 'Integrate', description: 'Access events update security, occupancy, lighting and operational workflows.' }],
      includedTitle: 'What is included in access control', includedBody: 'The access package connects credentials, schedules, doors and monitoring so entry and movement are managed consistently across the building.',
      included: ['Cards, PIN and mobile credential management.', 'Door, lift and barrier access rules.', 'Schedule-based permissions and restricted zones.', 'Alarm and event integration.', 'Occupancy and status monitoring.'],
      benefitTitle: 'A clearer access experience', benefitBody: 'Access control makes it easier to manage people flow and building security from one coordinated system, rather than as separate door or lift controls.',
      benefits: ['Safer, more consistent access across the building.', 'Simpler credential management and schedules.', 'Better coordination with alarms and building systems.', 'Clearer visibility of entry and movement.'],
      applicationsTitle: 'Where access control fits', applicationsBody: 'Access control supports offices, residential buildings, hotels, schools, healthcare, retail and mixed-use sites with multiple entry points and user groups.',
      applications: ['Offices: controlled entry for staff and visitors.', 'Residences: secure tenant and service access.', 'Hotels: guest, staff and service zones.', 'Healthcare: restricted clinical, staff and public areas.'],
    }),
    'control-mobility': specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'Every system, one interface - locally and remotely.', howBody: 'Control and mobility bring the complete building into one clear interface for users, operators and facility teams.',
      steps: [{ title: 'Connect', description: 'Lighting, climate, shading, access, security and energy share one control layer.' }, { title: 'Control', description: 'Use wall controls, touch panels, mobile apps or secure remote access.' }, { title: 'Automate', description: 'Schedules, notifications and scenes reduce repetitive manual operation.' }],
      includedTitle: 'What control and mobility can include', includedBody: 'The control package brings together local and remote interfaces, automations, permissions and status visibility for the whole building.',
      included: ['Unified app and touch panel control.', 'Voice and geolocation triggers.', 'Secure remote access.', 'Automations and schedules.', 'Role-based permissions and notifications.'],
      benefitTitle: 'One interface for every user', benefitBody: 'Control and mobility let people use the same system whether they are in the building or working remotely, while giving operators and facilities better visibility.',
      benefits: ['Clearer building control for occupants.', 'Remote access for operators and managers.', 'Consistent routines and automations.', 'Simpler coordination of systems and teams.'],
      applicationsTitle: 'Where control and mobility fit', applicationsBody: 'Control and mobility suit homes, workplaces, hospitality and mixed-use buildings that need local, mobile and remote management from one platform.',
      applications: ['Homes: app and voice control for daily routines.', 'Offices: remote operation and meeting room readiness.', 'Hotels: guest and staff control with secure access.', 'Facilities: status, alerts and centralized operation.'],
    }),
    'home-cinema': specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'Cinema performance with one-touch simplicity.', howBody: 'Home cinema coordinates audio, video, lighting and shading so the complete room is prepared from a single command.',
      steps: [{ title: 'Prepare', description: 'Lighting dims, shading closes and the AV system starts in the correct mode.' }, { title: 'Control', description: 'One interface replaces multiple remotes and complex sequences.' }, { title: 'Enjoy', description: 'Calibrated sound and video deliver a consistent premium experience.' }],
      includedTitle: 'Cinema system elements', includedBody: 'The package depends on the desired room experience and selected audio-video equipment.',
      included: ['Display or projector integration.', 'Audio system and speaker coordination.', 'Lighting and shading cinema scenes.', 'Climate and comfort preparation for viewing modes.', 'Simple control for sources, volume and room state.'],
      benefitTitle: 'A cinema experience that starts with one command', benefitBody: 'Users can move from normal room use to viewing mode quickly, without adjusting multiple systems separately.',
      benefits: ['Cleaner control of audio-video equipment.', 'Consistent lighting and shading for viewing.', 'Better comfort during longer sessions.', 'Reduced setup friction for family, guests or staff.'],
      applicationsTitle: 'Where home cinema fits', applicationsBody: 'Home cinema systems fit dedicated cinema rooms, living rooms, premium apartments, hospitality lounges and multipurpose rooms that need polished AV scenes.',
      applications: ['Homes: cinema, sports and gaming scenes.', 'Apartments: compact AV and lighting control.', 'Hotels: premium lounge or suite experiences.', 'Event rooms: presentation and screening modes.'],
    }),
    'scenes': specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'One action. Multiple systems. A complete experience.',
      howBody: 'Scenes combine lighting, climate, shading, audio and security into coordinated actions that match each moment of the day.',
      steps: [{ title: 'Choose', description: 'Select the moment, activity or event that should trigger the scene.' }, { title: 'Coordinate', description: 'All connected systems move to the predefined settings together.' }, { title: 'Run', description: 'Activate scenes from a button, app, schedule or automatically by presence.' }],
      includedTitle: 'What scenes can include', includedBody: 'Scene scope is defined by the systems present and the desired routine or event.',
      included: ['Lighting scenes and preset ambiences.', 'Climate and comfort presets.', 'Shading and privacy actions.', 'Audio moods and AV control.', 'Security modes and presence-based triggers.'],
      benefitTitle: 'A complete experience from one command', benefitBody: 'Scenes simplify daily routines by activating multiple systems together, reducing manual effort while keeping the space comfortable and secure.',
      benefits: ['Faster transitions between daily activities.', 'More consistent comfort and security.', 'Reduced need for multiple remote controls or apps.', 'Easier operation for every user.'],
      applicationsTitle: 'Where scenes fit', applicationsBody: 'Scenes are useful in homes, offices, hospitality, retail and event spaces that benefit from coordinated comfort, mood and operational modes.',
      applications: ['Morning routines for homes and workplaces.', 'Away and security modes for residences.', 'Event or hospitality scenes for guest experiences.', 'Relax and welcome scenes in living spaces and public areas.'],
    }),
    security: specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'Security systems that operate as one coordinated layer.', howBody: 'Intrusion detection, CCTV, safety sensors and access events are combined for faster response and clearer control.',
      steps: [{ title: 'Detect', description: 'Sensors and cameras identify intrusion, hazards and abnormal events.' }, { title: 'Verify', description: 'The system correlates alarms, video and access information.' }, { title: 'Respond', description: 'Notifications and coordinated building actions are triggered automatically.' }],
      includedTitle: 'Security layers', includedBody: 'The security scope is selected according to the building risk level, entry points and monitoring requirements.',
      included: ['Intrusion sensors and alarm logic.', 'Video surveillance and recording where included.', 'Access events and restricted-area monitoring.', 'Notifications for alarms or critical status changes.', 'Away, Alarm and Night scenario behavior.'],
      benefitTitle: 'A clearer response when security matters', benefitBody: 'Integrated security gives users simpler modes and gives owners better visibility. Automation can support safety without turning every function into one confusing block.',
      benefits: ['More understandable security modes.', 'Faster awareness through targeted notifications.', 'Better relationship between access, video and alarms.', 'Useful actions such as lights on during alarm events.'],
      applicationsTitle: 'Scenario examples', applicationsBody: 'Security integration supports homes, apartments, condominiums, offices, hotels, schools, factories, warehouses, parking and public spaces.',
      applications: ['Away: reduce comfort loads and arm selected zones.', 'Alarm: notify, record and activate safety lighting.', 'Night: protect perimeter while allowing interior comfort.', 'Restricted areas: combine credentials, logs and alerts.'],
    }),
    shading: specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'Natural light, privacy and thermal comfort - all coordinated.',
      howBody: 'Smart shading controls blinds, curtains and shutters according to sun position, room use, schedule and season.',
      steps: [{ title: 'Track', description: 'The system follows sunlight, facade orientation and indoor conditions.' }, { title: 'Position', description: 'Each blind or curtain moves to the most suitable level automatically.' }, { title: 'Coordinate', description: 'Shading supports lighting, climate, privacy and security scenes.' }],
      includedTitle: 'What shading control can include', includedBody: 'The scope is shaped around the facade, window type, motorized equipment and desired comfort rules.',
      included: ['Blind, shutter, curtain or facade-group control.', 'Automatic sun protection and glare reduction.', 'Privacy, night and security positions.', 'Weather-aware protection where supported by equipment.', 'Scene integration with lighting, climate and security.'],
      benefitTitle: 'More comfort from natural light', benefitBody: 'Automated shading helps use daylight without glare, supports thermal comfort and keeps privacy settings consistent across the building.',
      benefits: ['Reduced glare during working, relaxing or presentation modes.', 'Better thermal performance by limiting unwanted heat gain.', 'Simpler control for multiple windows and facades.', 'More consistent privacy and night behavior.'],
      applicationsTitle: 'Where shading automation fits', applicationsBody: 'Smart shading is valuable in homes, apartments, offices, hotels, schools, healthcare spaces and any facade with changing daylight conditions.',
      applications: ['Homes: comfort scenes and privacy routines.', 'Offices: glare control for desks and meeting rooms.', 'Hotels: guest-room scenes and energy-aware positions.', 'Education and healthcare: predictable comfort in occupied rooms.'],
    }),
    ventilation: specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'Healthy air delivered only when and where it is needed.',
      howBody: 'Ventilation adapts airflow using occupancy, humidity, CO2 and air-quality data while recovering energy whenever possible.',
      steps: [{ title: 'Measure', description: 'Air-quality and occupancy sensors monitor each space continuously.' }, { title: 'Adjust', description: 'Airflow and operating mode change automatically by demand.' }, { title: 'Recover', description: 'Heat recovery improves efficiency while maintaining fresh air.' }],
      includedTitle: 'Ventilation scope', includedBody: 'The final scope depends on the selected equipment and the building areas that need monitored airflow.',
      included: ['Air-quality and humidity monitoring.', 'Demand-based operating modes.', 'Heat-recovery or filtration integration where equipment supports it.', 'Alerts for poor air quality or abnormal conditions.', 'Central and mobile visibility for facility teams.'],
      benefitTitle: 'Healthier air with less unnecessary operation', benefitBody: 'Ventilation becomes easier to understand and manage because users can see conditions and the system can react when the building actually needs fresh air.',
      benefits: ['Better indoor air quality awareness.', 'Reduced runtime when spaces are empty or within target values.', 'More consistent comfort in occupied rooms.', 'Useful integration with climate and scheduling.'],
      applicationsTitle: 'Where ventilation control fits', applicationsBody: 'Smart ventilation is useful in homes, offices, schools, hospitality, healthcare and spaces where occupancy or air quality changes during the day.',
      applications: ['Homes: humidity and freshness control.', 'Offices and schools: demand-based airflow for occupied rooms.', 'Hotels and restaurants: comfort with operator visibility.', 'Healthcare and public areas: clearer environmental monitoring.'],
    }),
    'irrigation': specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand the solution - clearly organised and easy to explore.',
      howTitle: 'Water exactly where it is needed - never where it is not.',
      howBody: 'Smart irrigation coordinates zones, schedules, weather and soil conditions to protect landscaping and reduce water waste.',
      steps: [{ title: 'Measure', description: 'Weather, rainfall and soil conditions determine the real irrigation demand.' }, { title: 'Schedule', description: 'Each area receives the right duration and sequence automatically.' }, { title: 'Protect', description: 'Leak, tank and pump conditions can pause irrigation and trigger alerts.' }],
      includedTitle: 'What smart irrigation can include', includedBody: 'The irrigation package combines weather, soil, zone and pump control so outdoor watering is precise and efficient.',
      included: ['Weather-aware irrigation schedules.', 'Soil moisture and rainfall sensing.', 'Zone-by-zone watering control.', 'Leak and pump monitoring.', 'Alerts for abnormal outdoor conditions.'],
      benefitTitle: 'Water efficiency with better plant health', benefitBody: 'Smart irrigation reduces waste while keeping landscaping healthy by making every watering decision based on real conditions.',
      benefits: ['Less water wasted on unnecessary irrigation.', 'Better plant health through targeted watering.', 'Simpler outdoor control and scheduling.', 'Early alerts for leaks and pump issues.'],
      applicationsTitle: 'Where irrigation fits', applicationsBody: 'Irrigation works well for residential gardens, public green spaces, hospitality landscapes and commercial grounds that need reliable water management.',
      applications: ['Homes: lawns, gardens and planting beds.', 'Parks: paths, trees and lawns.', 'Hotels: landscaping and poolside greenery.', 'Commercial sites: planting, lawns and outdoor amenity areas.'],
    }),
  },
  buildings: {
    home: specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand this solution - clearly organised and easy to explore.',
      howTitle: 'A home that responds naturally to everyday life.',
      howBody: 'Lighting, climate, shading, security, audio and energy work together to create comfort without complicated daily control.',
      steps: [
        { title: 'Understand', description: 'Define rooms, routines, comfort preferences and the desired level of automation.' },
        { title: 'Adapt', description: 'The home responds to presence, time, daylight, temperature and user scenes.' },
        { title: 'Simplify', description: 'Every function remains easy to use from buttons, panels and one mobile interface.' },
      ],
      includedTitle: 'What is included in a smart home',
      includedBody: 'The smart home package brings together the systems residents use every day in one coordinated platform.',
      included: [
        'Lighting scenes, comfort and energy-aware control.',
        'Zoned climate and schedules for every room.',
        'Security, access and sensors working together.',
        'Automated shading, irrigation and outdoor management.',
      ],
      benefitTitle: 'Key benefits for the whole home',
      benefitBody: 'A smart home makes daily routines smoother, improves safety and helps reduce utility use by coordinating the systems that matter most.',
      benefits: [
        'Natural comfort across lighting, climate and shading.',
        'Simpler resident control from one interface.',
        'Improved safety with integrated security and access.',
        'Better energy visibility and outdoor automation.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Smart homes fit families, luxury residences and modern new builds that want comfort, safety and efficiency from day one.',
      applications: [
        'Family homes: daily routines, away modes and evening scenes.',
        'Luxury residences: premium comfort with one-touch control.',
        'New builds: integrated smart systems from the start.',
        'Renovations: add smarter control without separate devices.',
      ],
      tags: ['Lighting', 'Climate', 'Security', 'Energy'],
    }),
    condominiums: specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand this solution - clearly organised and easy to explore.',
      howTitle: 'One scalable infrastructure for every apartment and shared space.',
      howBody: 'Smart condominium systems standardise apartments while coordinating access, energy, safety and common-space operation.',
      steps: [
        { title: 'Standardise', description: 'Create repeatable apartment packages with clear functions and predictable delivery.' },
        { title: 'Manage', description: 'Shared access, lighting, metering and technical systems are monitored centrally.' },
        { title: 'Expand', description: 'The solution grows from one building to complete residential developments.' },
      ],
      includedTitle: 'What is included in smart condominiums',
      includedBody: 'The condominium package brings the buildingâ€™s shared systems, resident services and administration tools together in one platform.',
      included: [
        'Central common-area lighting and presence-based control.',
        'Secure resident and visitor access management.',
        'Utility metering and transparent cost distribution.',
        'Admin dashboards for pumps, lighting and technical systems.',
      ],
      benefitTitle: 'Key benefits for residents and owners',
      benefitBody: 'Smart condominiums reduce shared costs, improve resident satisfaction and make building management easier through one coordinated infrastructure.',
      benefits: [
        'More consistent comfort and security in shared spaces.',
        'Transparent expenses and fair billing for residents.',
        'Simpler building administration from one platform.',
        'Better protection and monitoring for common areas.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Smart condominiums work for residential buildings, housing associations and mixed-use developments with shared systems and resident services.',
      applications: [
        'Multi-unit buildings: common areas, elevators and safety systems.',
        'Managed residences: easier operator oversight and resident support.',
        'New developments: predictable packages for owners and buyers.',
        'Renovations: upgrade shared systems with central monitoring and control.',
      ],
      tags: ['Common areas', 'Access', 'Metering', 'Management'],
    }),
    apartments: specDetail({
      detailHeading: 'Comfort and control, without complexity.',
      introduction: 'Apartment functions remain simple for residents while lighting, climate, shading, access and energy work together.',
      howTitle: 'Comfort and control, without complexity.',
      howBody: 'Apartment functions remain simple for residents while lighting, climate, shading, access and energy work together.',
      steps: [
        { title: 'Personalise', description: 'Set scenes, temperatures and access rights for each apartment.' },
        { title: 'Automate', description: 'Schedules and sensors reduce manual control and wasted energy.' },
        { title: 'Monitor', description: 'Residents and administrators can review status from one app.' },
      ],
      includedTitle: 'What is included in apartment automation',
      includedBody: 'The apartment package brings core living functions together in a compact, easy-to-use smart system.',
      included: [
        'Lighting scenes and comfort settings for daily routines.',
        'Zoned climate control and shading for privacy and efficiency.',
        'Smart access, intercom and security integration.',
        'Energy metering and app-based resident control.',
      ],
      benefitTitle: 'Key benefits for residents and developers',
      benefitBody: 'Smart apartments deliver better comfort, simpler control and stronger energy visibility without adding complexity for occupants.',
      benefits: [
        'Personalised comfort from one coordinated system.',
        'Fewer manual adjustments with automated schedules.',
        'Clearer security and access for residents.',
        'Better energy awareness in compact living spaces.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Apartment automation is ideal for residential units, rental buildings and developments that need consistent comfort and efficient control.',
      applications: [
        'Studio apartments: compact comfort with easy control.',
        'Family flats: zoned lighting, climate and security.',
        'Multiple unit buildings: consistent resident experiences.',
        'Developer projects: repeatable smart apartment packages.',
      ],
      tags: ['Comfort', 'Access', 'Energy', 'Control'],
    }),
    hotels: specDetail({
      detailHeading: 'A better guest stay, with lower operating effort.',
      introduction: 'Room automation combines comfort, energy control, access and hotel services without adding complexity for the guest.',
      howTitle: 'A better guest stay, with lower operating effort.',
      howBody: 'Room automation combines comfort, energy control, access and hotel services without adding complexity for the guest.',
      steps: [
        { title: 'Welcome', description: 'Prepare lighting, climate and services before the guest enters.' },
        { title: 'Occupancy', description: 'Room status and presence automatically adjust energy use.' },
        { title: 'Service', description: 'DND, MUR, alarms and housekeeping status reach the right staff.' },
      ],
      includedTitle: 'What is included in hotel automation',
      includedBody: 'The hotel package brings room scenes, climate, access, service modes and energy management together in one guest-ready system.',
      included: [
        'Guest room lighting, climate and shading scenes.',
        'Smart access, mobile keys and secure entry.',
        'Service modes for housekeeping, DND and alarms.',
        'Room energy monitoring and setback control.',
      ],
      benefitTitle: 'Key benefits for guests and operators',
      benefitBody: 'Smart hotel rooms improve the guest experience while reducing operating effort and energy waste for staff and managers.',
      benefits: [
        'More consistent guest comfort from arrival to departure.',
        'Simpler room operation through automated hotel modes.',
        'Faster housekeeping and service coordination.',
        'Lower energy use in empty rooms without compromising comfort.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Hotel room automation suits boutique hotels, aparthotels, serviced apartments and hospitality properties that want premium comfort and efficient operation.',
      applications: [
        'Guest rooms: arrival, sleep and away modes.',
        'Suites: premium scenes, access and service integration.',
        'Aparthotels: consistent control for guests and owners.',
        'Hospitality properties: centralized room status and energy oversight.',
      ],
      tags: ['Guest comfort', 'Service', 'Access', 'Energy'],
    }),
    'real-estate-developments': specDetail({
      detailHeading: 'Smart infrastructure designed into every unit.',
      introduction: 'A repeatable technical package creates consistency for buyers, simpler delivery for developers and long-term scalability.',
      howTitle: 'Smart infrastructure designed into every unit.',
      howBody: 'A repeatable technical package creates consistency for buyers, simpler delivery for developers and long-term scalability.',
      steps: [
        { title: 'Standardise', description: 'Define a clear package and common functions for every unit.' },
        { title: 'Deliver', description: 'Coordinate design, installation, commissioning and documentation.' },
        { title: 'Scale', description: 'Extend the same architecture from one building to the full development.' },
      ],
      includedTitle: 'What is included in development infrastructure',
      includedBody: 'The development package brings repeatable smart apartment functions, shared systems and technical documentation together for reliable delivery.',
      included: [
        'Repeatable smart apartment packages for every unit.',
        'Common shared systems for access, energy and security.',
        'Design-ready infrastructure and documentation.',
        'Scalable architecture from one block to multiple buildings.',
      ],
      benefitTitle: 'Key benefits for developers and owners',
      benefitBody: 'Standardised smart infrastructure reduces delivery risk, improves buyer confidence and makes future upgrades easier.',
      benefits: [
        'More consistent quality across the development.',
        'Faster and clearer project delivery.',
        'Stronger sales value for smart-ready homes.',
        'Simpler upgrades and future-proof scalability.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Real estate development automation is ideal for residential projects, mixed-use towers and masterplanned communities seeking a standard smart package.',
      applications: [
        'Housing developments: consistent smart units throughout.',
        'Build-to-rent: repeatable packages for tenant-ready apartments.',
        'Mixed-use projects: shared systems with apartment comfort.',
        'Long-term developments: scalable infrastructure from phase to phase.',
      ],
      tags: ['Standardisation', 'Scalability', 'Developer', 'Units'],
    }),
    offices: specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand this solution - clearly organised and easy to explore.',
      howTitle: 'Workspaces that adapt to people, activity and energy.',
      howBody: 'Smart offices combine lighting, climate, shading, access and occupancy information to improve comfort and productivity.',
      steps: [
        { title: 'Detect', description: 'Presence and booking information show how rooms and work areas are being used.' },
        { title: 'Adjust', description: 'Lighting, climate and shading adapt automatically to occupancy and daylight.' },
        { title: 'Optimise', description: 'Energy data and schedules reduce waste while keeping working conditions consistent.' },
      ],
      includedTitle: 'What is included in a smart office',
      includedBody: 'The office package combines adaptive environments, secure entry, occupancy logic and energy management for modern workplaces.',
      included: [
        'Adaptive lighting for focus, meetings and circulation.',
        'Zoned climate control for comfort and efficiency.',
        'Secure access and occupancy-aware room control.',
        'Energy-aware scheduling and shared workspace monitoring.',
      ],
      benefitTitle: 'Key benefits for people and operations',
      benefitBody: 'Smart offices make spaces more comfortable, more productive and easier to manage by adapting systems to real use and reducing unnecessary energy use.',
      benefits: [
        'More consistent comfort across offices and meeting rooms.',
        'Simpler control for occupants and facility teams.',
        'Lower energy waste in unoccupied spaces.',
        'Better coordination between lighting, climate and shading.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Smart office systems fit corporate buildings, co-working spaces, headquarters and flexible workplaces that need adaptable comfort and efficient operation.',
      applications: [
        'Corporate offices: supporting productivity and hybrid use.',
        'Co-working spaces: flexible control for changing occupancy.',
        'Headquarters: consistent comfort and modern workplace image.',
        'Business centers: efficient shared-room management.',
      ],
      tags: ['Occupancy', 'Comfort', 'Energy', 'Access'],
    }),
    'restaurants-bars': specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand this solution - clearly organised and easy to explore.',
      howTitle: 'Atmosphere, comfort and operations coordinated in one system.',
      howBody: 'Restaurants and bars need memorable ambience for guests and practical control for staff, from opening to closing.',
      steps: [
        { title: 'Prepare', description: 'Lighting, music, climate and shading are set for each service period.' },
        { title: 'Operate', description: 'Staff use simple scenes instead of controlling many systems separately.' },
        { title: 'Protect', description: 'Closing routines coordinate lighting, access, security and energy saving.' },
      ],
      includedTitle: 'What is included in venue control',
      includedBody: 'The restaurant and bar package brings together ambience control, operational scenes, access and efficiency in one platform.',
      included: [
        'Scene-based lighting, audio and climate for different service modes.',
        'Operator controls for bar, dining and event areas.',
        'Access, security and after-hours protection.',
        'Energy-aware shut down and occupancy tracking.',
      ],
      benefitTitle: 'Key benefits for guests and staff',
      benefitBody: 'Smart venue control helps deliver a consistent guest experience while making operations simpler and costs easier to manage.',
      benefits: [
        'More memorable ambience from one coordinated system.',
        'Faster service setup with scene control.',
        'Better energy performance outside service hours.',
        'Safer control of access and security after closing.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Restaurants and bars benefit from systems that support multiple service modes, staff workflows and memorable guest experiences.',
      applications: [
        'Fine dining: curated lighting and acoustic atmospheres.',
        'Casual bars: flexible scenes for day, evening and event modes.',
        'Hotels: integrated F&B spaces with consistent control.',
        'Venue bars: smooth transitions between service periods.',
      ],
      tags: ['Ambience', 'Audio', 'Climate', 'Security'],
    }),
    'event-spaces': specDetail({
      detailHeading: 'One venue. Multiple configurations.',
      introduction: 'Event presets transform lighting, audio, climate, access and safety for each activity without requiring the room setup.',
      howTitle: 'One venue. Multiple configurations.',
      howBody: 'Event presets transform lighting, audio, climate, access and safety for each activity without requiring the room setup.',
      steps: [
        { title: 'Select', description: 'Choose the event type, capacity and required operating mode.' },
        { title: 'Adapt', description: 'Lighting, sound, climate and access move to the correct preset.' },
        { title: 'Operate', description: 'The team monitors the complete space from one interface.' },
      ],
      includedTitle: 'What is included in event space automation',
      includedBody: 'The event space package brings flexible presets, room control, safety and audio together so the venue can change use quickly and reliably.',
      included: [
        'Event presets for conferences, weddings and performances.',
        'Zoned lighting, audio and climate control.',
        'Access management and safety monitoring.',
        'Operator control from one interface or tablet.',
      ],
      benefitTitle: 'Key benefits for venue operators',
      benefitBody: 'Flexible event space control reduces setup time, improves technical consistency and gives operators a clear way to manage every occasion.',
      benefits: [
        'Faster transitions between event formats.',
        'More reliable technical setup for every use.',
        'Clearer venue control for staff and operators.',
        'Better audience experience with fewer compromises.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Event space automation is ideal for halls, conference centres, wedding venues and multipurpose rooms that host diverse activities.',
      applications: [
        'Conference centres: presets for sessions and breaks.',
        'Wedding venues: ceremony, reception and party modes.',
        'Cultural spaces: performances, talks and receptions.',
        'Multipurpose rooms: adaptable layouts and lighting.',
      ],
      tags: ['Events', 'Presets', 'Audio', 'Safety'],
    }),
    schools: specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand this solution - clearly organised and easy to explore.',
      howTitle: 'Safer, healthier learning spaces with simpler operation.',
      howBody: 'Smart schools coordinate lighting, air quality, climate, access and energy around timetables, occupancy and safety needs.',
      steps: [
        { title: 'Schedule', description: 'Classrooms and shared areas follow the academic timetable automatically.' },
        { title: 'Maintain', description: 'Light, temperature and air quality remain suitable for learning and concentration.' },
        { title: 'Secure', description: 'Access, alerts and central supervision support safer daily operation.' },
      ],
      includedTitle: 'What is included in school automation',
      includedBody: 'The school package connects classrooms, corridors and common spaces to improve health, safety and operational efficiency.',
      included: [
        'Classroom lighting and presentation scenes.',
        'Ventilation and air quality monitoring.',
        'Access control and safety alarms.',
        'Schedule-based control for rooms and common areas.',
      ],
      benefitTitle: 'Key benefits for students and staff',
      benefitBody: 'Smart schools make learning spaces more consistent, safer and easier to manage so teachers can focus on education and facilities teams can reduce waste.',
      benefits: [
        'Healthier classrooms with better air quality.',
        'More reliable learning conditions for students.',
        'Simpler control for teaching and maintenance teams.',
        'Safer, timetable-aware building operation.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Smart schools fit educational campuses, training centers and care-focused learning environments that need better air, access and operations.',
      applications: [
        'Classrooms: focus light and fresh air on demand.',
        'Shared areas: schedule-based comfort and security.',
        'Admin buildings: central control for facility teams.',
        'Campus networks: consistent performance across multiple buildings.',
      ],
      tags: ['Classrooms', 'Air quality', 'Safety', 'Schedules'],
    }),
    hospitals: specDetail({
      detailHeading: 'Reliable control for critical environments.',
      introduction: 'Access, air quality, temperature, lighting, alarms and energy resilience are coordinated around patient and staff safety.',
      howTitle: 'Reliable control for critical environments.',
      howBody: 'Access, air quality, temperature, lighting, alarms and energy resilience are coordinated around patient and staff safety.',
      steps: [
        { title: 'Secure', description: 'Control zones, permissions and audit trails for every user group.' },
        { title: 'Monitor', description: 'Track air quality, climate, alarms and room conditions continuously.' },
        { title: 'Maintain', description: 'Use clear status information to support faster technical response.' },
      ],
      includedTitle: 'What is included in hospital automation',
      includedBody: 'The hospital package brings critical systems together so healthcare environments can stay safe, hygienic and operationally reliable.',
      included: [
        'Secure access and permissioned zones.',
        'Ventilation and air-quality monitoring with precise climate control.',
        'Adaptive lighting, alarms and patient-area alerts.',
        'Backup-ready energy and facility monitoring.',
      ],
      benefitTitle: 'Key benefits for healthcare operators',
      benefitBody: 'Smart hospitals reduce risk and improve reliability by giving staff clearer control over critical environments and faster visibility into technical status.',
      benefits: [
        'More dependable control in patient and clinical areas.',
        'Improved hygiene and air quality oversight.',
        'Faster alarm response and technical visibility.',
        'Greater energy resilience for critical systems.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Hospital automation suits hospitals, clinics, medical labs and healthcare facilities that need dependable environment control and safety.',
      applications: [
        'Patient wards: secure, comfortable and clean control.',
        'Clinical areas: precise air quality and temperature management.',
        'Staff zones: access, alarms and operational visibility.',
        'Support facilities: resilient energy and system monitoring.',
      ],
      tags: ['Safety', 'Hygiene', 'Resilience', 'Control'],
    }),
    factories: specDetail({
      detailHeading: 'More detail, whenever you need it.',
      introduction: 'Everything you need to understand this solution - clearly organised and easy to explore.',
      howTitle: 'Automation that supports production, safety and energy.',
      howBody: 'Smart factory infrastructure connects building services with operational requirements for clearer control and lower running costs.',
      steps: [
        { title: 'Monitor', description: 'Energy, utilities, indoor conditions and technical alarms are visible in real time.' },
        { title: 'Coordinate', description: 'Lighting, ventilation, access and schedules support each production area.' },
        { title: 'Improve', description: 'Data reveals waste, abnormal consumption and opportunities for optimisation.' },
      ],
      includedTitle: 'What is included in factory automation',
      includedBody: 'The factory package brings infrastructure, monitoring and operational controls together so the plant can run safely and efficiently.',
      included: [
        'Process and energy monitoring for key systems.',
        'Zoned industrial lighting and ventilation control.',
        'Secure access, CCTV and alarm integration.',
        'Central dashboards for operators and maintenance teams.',
      ],
      benefitTitle: 'Key benefits for production and teams',
      benefitBody: 'Smart factories give operations real-time visibility, safer control and better energy performance without adding complexity for staff.',
      benefits: [
        'Clearer oversight of energy and production conditions.',
        'Improved safety through coordinated access and alarms.',
        'Lower waste through condition-based control.',
        'Simpler management from one integrated dashboard.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Factory automation works for manufacturing plants, industrial halls, production facilities and technical sites that need reliable control and efficiency.',
      applications: [
        'Manufacturing plants: process visibility and energy optimisation.',
        'Industrial halls: zone-based lighting and safety control.',
        'Production facilities: integrated alarms and access management.',
        'Technical buildings: centralized monitoring and operator dashboards.',
      ],
      tags: ['Production', 'Utilities', 'Safety', 'Energy'],
    }),
    warehouses: specDetail({
      detailHeading: 'Automation focused on safety and logistics.',
      introduction: 'Lighting, access, surveillance, climate and energy monitoring respond to activity across docks, aisles and restricted zones.',
      howTitle: 'Automation focused on safety and logistics.',
      howBody: 'Lighting, access, surveillance, climate and energy monitoring respond to activity across docks, aisles and restricted zones.',
      steps: [
        { title: 'Detect', description: 'Presence and operational schedules activate only the areas in use.' },
        { title: 'Control', description: 'Manage docks, gates, zones, lighting and climate centrally.' },
        { title: 'Improve', description: 'Use consumption and status data to optimize daily operations.' },
      ],
      includedTitle: 'What is included in warehouse automation',
      includedBody: 'The warehouse package brings security, lighting, access and environmental monitoring together for safer, more efficient logistics operation.',
      included: [
        'Presence-based lighting for aisles and storage areas.',
        'Secure dock, gate and zone access control.',
        'Surveillance, alarms and activity monitoring.',
        'Climate and energy monitoring for sensitive goods.',
      ],
      benefitTitle: 'Key benefits for logistics operators',
      benefitBody: 'Smart warehouses reduce risk, improve visibility and simplify operation by coordinating safety, environment and access systems.',
      benefits: [
        'More reliable control across storage and loading areas.',
        'Better safety and security for goods and staff.',
        'Lower lighting and energy costs through activity-based control.',
        'Clearer operational insight for logistics teams.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Warehouse automation fits distribution centers, storage facilities, logistics hubs and industrial storage sites that need safer, more efficient operation.',
      applications: [
        'Distribution centers: dock, zone and energy coordination.',
        'Storage facilities: presence lighting and secure access.',
        'Cold storage: climate and energy monitoring for sensitive goods.',
        'Industrial logistics: surveillance and operational visibility.',
      ],
      tags: ['Logistics', 'Security', 'Lighting', 'Monitoring'],
    }),
    parking: specDetail({
      detailHeading: 'A safer, smoother parking journey.',
      introduction: 'Everything you need to understand this solution - clearly organised and easy to explore.',
      howTitle: 'A safer, smoother parking journey.',
      howBody: 'Access, guidance, lighting, charging and monitoring work as one coordinated parking system.',
      steps: [
        { title: 'Arrive', description: 'Plate recognition or credentials open the correct access point.' },
        { title: 'Guide', description: 'Occupancy data and lighting help drivers find available spaces.' },
        { title: 'Operate', description: 'Charging, CCTV and alarms are managed from one interface.' },
      ],
      includedTitle: 'What is included in parking automation',
      includedBody: 'The parking package brings access, lighting, monitoring and charging together for safer, more efficient operations.',
      included: [
        'Smart access control and plate recognition.',
        'Occupancy-aware guidance and presence lighting.',
        'EV charging coordination and load management.',
        'CCTV, alarms and central facility monitoring.',
      ],
      benefitTitle: 'Key benefits for users and operators',
      benefitBody: 'Smart parking improves user experience, increases safety and reduces operational friction through one coordinated system.',
      benefits: [
        'Faster arrival and departure with controlled access.',
        'Clearer wayfinding and available space guidance.',
        'Easier EV charging management and energy use.',
        'Better incident visibility and safer operations.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Parking automation works for garages, districts, campuses and commercial sites that need safer, more efficient parking management.',
      applications: [
        'Public garages: smoother traffic and better guidance.',
        'Office parking: controlled access and efficient charging.',
        'Residential parking: safer access and surveillance.',
        'Campus or retail sites: centralized monitoring and lighting.',
      ],
      tags: ['Access', 'Occupancy', 'Charging', 'Safety'],
    }),
    'outdoor-parks': specDetail({
      detailHeading: 'Connected public spaces that use less energy.',
      introduction: 'Smart lighting, irrigation, safety and amenities create greener, safer and easier-to-maintain outdoor environments.',
      howTitle: 'Connected public spaces that use less energy.',
      howBody: 'Smart lighting, irrigation, safety and amenities create greener, safer and easier-to-maintain outdoor environments.',
      steps: [
        { title: 'Monitor', description: 'Track light levels, weather conditions, water use and safety status.' },
        { title: 'Automate', description: 'Run lighting and irrigation only when conditions require it.' },
        { title: 'Maintain', description: 'Receive clear alerts and operating data for faster intervention.' },
      ],
      includedTitle: 'What is included in outdoor park automation',
      includedBody: 'The outdoor parks package brings adaptive lighting, irrigation, safety and remote monitoring together for healthier public spaces.',
      included: [
        'Adaptive path and area lighting.',
        'Weather-aware irrigation control.',
        'Safety sensors and CCTV monitoring.',
        'Connected amenities and remote oversight.',
      ],
      benefitTitle: 'Key benefits for public space owners',
      benefitBody: 'Smart outdoor spaces reduce energy use, improve safety and make management easier through clearer operating data and automation.',
      benefits: [
        'Lower energy and water consumption.',
        'Better safety after dark.',
        'More responsive grounds management.',
        'Greener, more attractive public areas.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Outdoor park automation suits public parks, landscaped campuses, residential grounds and hospitality outdoor areas.',
      applications: [
        'Municipal parks: safer paths and lighting control.',
        'Hotel grounds: amenity lighting and irrigation.',
        'Campus landscapes: energy-efficient outdoor systems.',
        'Residential communities: safer, greener shared spaces.',
      ],
      tags: ['Lighting', 'Irrigation', 'Safety', 'Energy'],
    }),
    stadiums: specDetail({
      detailHeading: 'One control layer for every event.',
      introduction: 'Lighting, access, climate, safety and energy are coordinated for match days, concerts and public events.',
      howTitle: 'One control layer for every event.',
      howBody: 'Lighting, access, climate, safety and energy are coordinated for match days, concerts and public events.',
      steps: [
        { title: 'Prepare', description: 'Load the event profile and prepare zones before visitors arrive.' },
        { title: 'Operate', description: 'Monitor access, comfort and safety from a central control room.' },
        { title: 'Reset', description: 'Return the venue to its standard mode after the event.', },
      ],
      includedTitle: 'What is included in stadium automation',
      includedBody: 'The stadium package brings lighting, access, safety, comfort and energy systems together so venues can run events safely and spectacularly.',
      included: [
        'Dynamic event lighting and show scenes.',
        'Crowd access and credentialed entry control.',
        'Safety sensors, CCTV and alarm coordination.',
        'Climate, ventilation and energy management for full venues.',
      ],
      benefitTitle: 'Key benefits for stadium operators',
      benefitBody: 'Smart stadium control improves event safety, operational visibility and spectator experience by unifying venue systems under one platform.',
      benefits: [
        'Simpler event preparation and mode changes.',
        'Better crowd flow and access oversight.',
        'Integrated safety and comfort for spectators.',
        'More consistent energy use during events.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Stadium automation works for arenas, sports venues, concert halls and public event spaces that need coordinated systems at scale.',
      applications: [
        'Sports stadiums: match-day lighting, access and security.',
        'Concert venues: show scenes and operational control.',
        'Arenas: integrated comfort, safety and energy management.',
        'Event spaces: smooth transitions between event modes.',
      ],
      tags: ['Events', 'Access', 'Safety', 'Energy'],
    }),
  },
  solutions: {
    design: specDetail({
      detailHeading: 'A clear route from need to technical solution.',
      introduction: 'Design converts objectives, constraints and budgets into coordinated documentation ready for implementation.',
      howTitle: 'A clear route from need to technical solution.',
      howBody: 'Design converts objectives, constraints and budgets into coordinated documentation ready for implementation.',
      steps: [
        { title: 'Analyse', description: 'Confirm spaces, functions, priorities, budget and technical constraints.' },
        { title: 'Design', description: 'Define architecture, equipment, schematics and operating logic.' },
        { title: 'Validate', description: 'Review performance, quantities, costs and future scalability.' },
      ],
      includedTitle: 'What is included in design',
      includedBody: 'The design package delivers a technical project that aligns building use, system scope and implementation readiness.',
      included: [
        'Needs analysis and project objectives.',
        'Custom system architecture and schematics.',
        'Budget planning and technical validation.',
        'Documentation for installation and commissioning.',
      ],
      benefitTitle: 'Key benefits for projects and installers',
      benefitBody: 'Good design reduces risk, avoids oversizing and makes the implementation phase simpler and more predictable.',
      benefits: [
        'Clear technical direction before installation starts.',
        'Fewer surprises and better budget control.',
        'A scalable solution built for the actual building.',
        'Cleaner handoff to installers and operators.',
      ],
      applicationsTitle: 'Project applications',
      applicationsBody: 'Design works for building owners, developers, architects and installers who want a smart building solution that fits from the start.',
      applications: [
        'New builds: integrated smart systems from the beginning.',
        'Renovations: design smart upgrades with minimal disruption.',
        'Developer projects: consistent technical packages for multiple sites.',
        'Complex buildings: tailored control for mixed systems.',
      ],
      tags: ['Technical design', 'Planning', 'Documentation', 'Scalability'],
    }),
    implementation: specDetail({
      detailHeading: 'From approved design to a working system.',
      introduction: 'Installation, commissioning and training are delivered through one controlled process.',
      howTitle: 'From approved design to a working system.',
      howBody: 'Installation, commissioning and training are delivered through one controlled process.',
      steps: [
        { title: 'Prepare', description: 'Confirm equipment, interfaces, programme and site requirements before work begins.' },
        { title: 'Install', description: 'Coordinate certified installation and system integration against the approved design.' },
        { title: 'Commission', description: 'Test every function, document results and train the people who operate the building.' },
      ],
      includedTitle: 'What is included in implementation',
      includedBody: 'The implementation package delivers the installed system, verified performance and a handover that makes operation clear.',
      included: [
        'Premium equipment procurement and installation.',
        'Certified system integration and wiring.',
        'Testing, commissioning and validation.',
        'User training and operational handover.',
      ],
      benefitTitle: 'Key benefits for project delivery',
      benefitBody: 'Professional implementation reduces project risk, improves reliability and ensures the design works exactly as intended.',
      benefits: [
        'Smooth transition from design to operation.',
        'Tested and reliable system delivery.',
        'Clear documentation and handover for operators.',
        'Certified installation with fewer surprises.',
      ],
      applicationsTitle: 'Handover',
      applicationsBody: 'Implementation is ideal for clients who want their smart building project delivered on time, on budget and by certified installers.',
      applications: [
        'New projects: complete system delivery and commissioning.',
        'Renovations: integration of new smart systems into existing buildings.',
        'Commercial installations: reliable handover for facilities teams.',
        'Technical upgrades: tested operation and operator training.',
      ],
      tags: ['Installation', 'Commissioning', 'Training', 'Handover'],
    }),
    maintenance: specDetail({
      detailHeading: 'Reliable performance, year after year.',
      introduction: 'Maintenance keeps every connected system current, secure and ready to perform.',
      howTitle: 'Reliable performance, year after year.',
      howBody: 'Maintenance keeps every connected system current, secure and ready to perform.',
      steps: [
        { title: 'Monitor', description: 'Remote health checks and alerts identify issues before they disrupt the building.' },
        { title: 'Maintain', description: 'Preventive visits, updates and optimisation preserve long-term performance.' },
        { title: 'Respond', description: 'Priority support and clear service records reduce downtime and uncertainty.' },
      ],
      includedTitle: 'What is included in maintenance',
      includedBody: 'The maintenance package covers preventive checks, remote monitoring, software updates and fast support to keep the building operating reliably.',
      included: [
        'Scheduled health checks and inspections.',
        '24/7 remote monitoring and alerts.',
        'Software updates and performance optimisation.',
        'Rapid response support and service documentation.',
      ],
      benefitTitle: 'Key benefits for building owners',
      benefitBody: 'Regular maintenance reduces failures, keeps systems secure and preserves performance over time with less guesswork for operators.',
      benefits: [
        'More reliable system performance year after year.',
        'Fewer unexpected service interruptions.',
        'Better long-term efficiency and security.',
        'Clear support and maintenance accountability.',
      ],
      applicationsTitle: 'Service options',
      applicationsBody: 'Maintenance plans suit homeowners, hospitality, workplaces, industrial facilities and public buildings that need dependable long-term support.',
      applications: [
        'Home systems: preventive checks and remote support.',
        'Hotels and offices: performance optimisation and security upkeep.',
        'Factories and hospitals: critical-system reliability and fast intervention.',
        'Public buildings: ongoing monitoring and maintenance plans.',
      ],
      tags: ['Monitoring', 'Updates', 'Support', 'Reliability'],
    }),
  },
};


const solutionProcesses = {
  design: [
    { title: 'Analysis', description: 'Clarify the building type, usage scenarios, budget direction, installed systems and future expansion needs.' },
    { title: 'Concept', description: 'Shape the integrated architecture for lighting, climate, shading, access, security, audio and energy control.' },
    { title: 'Technical design', description: 'Prepare schematics, specifications, equipment logic and documentation that installers can execute.' },
    { title: 'Validation', description: 'Check feasibility, compatibility, cost impact and the way users will operate the system day to day.' },
    { title: 'Documentation', description: 'Deliver a clear project package that connects decisions, scope and implementation responsibilities.' },
  ],
  implementation: [
    { title: 'Prepare', description: 'Coordinate drawings, equipment, cabling requirements, site readiness and installation sequence.' },
    { title: 'Install', description: 'Mount and connect devices, panels and integrations according to the approved technical design.' },
    { title: 'Commission', description: 'Program, test, tune and hand over the system so users can operate it confidently.' },
  ],
  maintenance: [
    { title: 'Monitor', description: 'Follow system behavior, alarms and user feedback so issues become visible before they grow.' },
    { title: 'Maintain', description: 'Update settings, inspect equipment logic and keep automation aligned with the building routine.' },
    { title: 'Respond', description: 'Diagnose support requests quickly and restore the intended operating state with clear responsibility.' },
  ],
};

const detailHeadingByCategory = {
  technology: (page) => `${page.title}: from function to integrated system`,
  buildings: (page) => `${page.title}: coordinated comfort, safety and efficiency`,
  solutions: (page) => `${page.title}: a clear path for smart building projects`,
};

const RO_TAB_LABELS = {
  'how-it-works': 'Cum funcționează',
  'what-is-included': 'Ce este inclus',
  'key-benefits': 'Beneficii cheie',
  'project-applications': 'Aplicații în proiecte',
};

const RO_CATEGORY_LABELS = {
  technology: 'Tehnologie',
  buildings: 'Clădiri și destinații',
  solutions: 'Soluții',
};

const RO_TAGS_BY_CATEGORY = {
  technology: ['Control', 'Automatizare', 'Integrare'],
  buildings: ['Confort', 'Siguranță', 'Eficiență'],
  solutions: ['Analiză', 'Proiect', 'Suport'],
};

const roDetailHeadingByCategory = {
  technology: (page) => `${page.title}: de la funcție la sistem integrat`,
  buildings: (page) => `${page.title}: confort, siguranță și eficiență coordonate`,
  solutions: (page) => `${page.title}: un traseu clar pentru proiecte smart building`,
};

const roSolutionProcesses = {
  design: [
    { title: 'Analiză', description: 'Clarificăm tipul clădirii, scenariile de utilizare, bugetul și nevoile de extindere.' },
    { title: 'Concept', description: 'Definim arhitectura integrată pentru iluminat, climatizare, umbrire, acces, securitate, audio și energie.' },
    { title: 'Proiect tehnic', description: 'Pregătim scheme, specificații, logică de echipamente și documentație pentru execuție.' },
    { title: 'Validare', description: 'Verificăm fezabilitatea, compatibilitatea, costurile și modul în care va fi folosit sistemul.' },
  ],
  implementation: [
    { title: 'Pregătire', description: 'Coordonăm desenele, echipamentele, cablarea, disponibilitatea șantierului și ordinea instalării.' },
    { title: 'Instalare', description: 'Montăm și conectăm dispozitivele, tablourile și integrările conform proiectului aprobat.' },
    { title: 'Punere în funcțiune', description: 'Programăm, testăm, ajustăm și predăm sistemul astfel încât utilizatorii să îl poată opera cu încredere.' },
  ],
  maintenance: [
    { title: 'Monitorizare', description: 'Urmărim comportamentul sistemului, alarmele și feedbackul utilizatorilor înainte ca problemele să crească.' },
    { title: 'Mentenanță', description: 'Actualizăm setările, verificăm logica echipamentelor și păstrăm automatizarea aliniată rutinei clădirii.' },
    { title: 'Răspuns', description: 'Diagnosticăm rapid solicitările de suport și readucem sistemul la starea de funcționare dorită.' },
  ],
};

function isRomanianPage(page) {
  return page?.language === 'ro';
}

function roPageNoun(page) {
  return (page.menuLabel || page.title || '').toLocaleLowerCase('ro-RO');
}

function roHumanList(items = []) {
  const clean = items.map(stripEnding).filter(Boolean);
  if (clean.length <= 1) return clean[0] || '';
  if (clean.length === 2) return `${clean[0]} și ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')} și ${clean.at(-1)}`;
}

function buildRoIntroduction(page) {
  const base = page.section === 'technology'
    ? `${page.supportingHeadline} Green Electric integrează ${roPageNoun(page)} într-un sistem coordonat, astfel încât funcția să lucreze împreună cu restul clădirii. ${page.heroDescription}`
    : page.section === 'buildings'
      ? `${page.supportingHeadline} Pentru ${roPageNoun(page)}, Green Electric coordonează confortul, siguranța, energia și controlul într-o infrastructură ușor de utilizat. ${page.heroDescription}`
      : `${page.supportingHeadline} Green Electric transformă cerințele într-un scop tehnic clar, cu responsabilități, echipamente și pași de implementare bine conectați. ${page.heroDescription}`;

  return clampWords(base, 115);
}

function buildRoSteps(page) {
  if (page.section === 'solutions' && roSolutionProcesses[page.slug]) return roSolutionProcesses[page.slug];

  if (page.features && page.features.length > 0) {
    return page.features.slice(0, 4).map((feature, index) => ({
      number: index + 1,
      title: feature.title,
      description: feature.description,
    }));
  }

  if (page.section === 'technology') {
    return [
      { title: 'Măsoară', description: `Senzorii, comenzile și programul urmăresc condițiile relevante pentru ${roPageNoun(page)}.` },
      { title: 'Decide', description: 'Controlerul aplică scenariul, nivelul sau regula potrivită pentru fiecare zonă.' },
      { title: 'Coordonează', description: 'Funcția lucrează împreună cu iluminatul, climatizarea, umbrirea, securitatea și energia.' },
    ];
  }

  return [
    { title: 'Definește', description: 'Stabilim spațiile, utilizatorii, prioritățile și nivelul de automatizare necesar.' },
    { title: 'Configurează', description: 'Funcțiile sunt adaptate pe camere, zone, programe, permisiuni și scenarii.' },
    { title: 'Optimizează', description: 'Sistemul oferă control mai clar, consum mai disciplinat și operare mai simplă.' },
  ];
}

function buildRoIncludedBullets(page) {
  if (page.features && page.features.length > 0) {
    return page.features.map((feature) => `${feature.title}: ${feature.description}`);
  }

  if (page.section === 'solutions') {
    return [
      'Analiză a cerințelor, spațiilor și priorităților proiectului.',
      'Definirea arhitecturii, funcțiilor și echipamentelor necesare.',
      'Coordonare între proiectare, instalare, punere în funcțiune și suport.',
      'Documentație clară pentru decizii, execuție și operare.',
    ];
  }

  if (page.section === 'buildings') {
    return [
      'Control pentru iluminat, climatizare, umbrire, acces, securitate și energie, în funcție de spațiu.',
      'Scenarii și programe adaptate rutinei ocupanților și operatorilor.',
      'Administrare locală, mobilă sau centralizată, cu permisiuni clare.',
      'Sistem scalabil, pregătit pentru extinderi și funcții viitoare.',
    ];
  }

  return [
    'Control local, mobil sau automat pentru funcțiile conectate.',
    'Reguli, programe și scenarii adaptate utilizării zilnice.',
    'Integrare cu celelalte sisteme ale clădirii.',
    'Configurare pe camere, zone sau grupuri, în funcție de proiect.',
  ];
}

function buildRoBenefitBullets(page) {
  if (page.section === 'solutions') {
    return ['Decizii tehnice mai clare înainte de instalare.', 'Risc redus în implementare și predare.', 'Costuri, responsabilități și pași mai ușor de urmărit.', 'Sistem pregătit pentru mentenanță și extindere.'];
  }

  if (page.section === 'buildings') {
    return ['Confort mai bun pentru utilizatorii spațiului.', 'Control mai simplu pentru operatori și administratori.', 'Consum mai disciplinat prin scenarii și programe.', 'Vizibilitate mai bună asupra stării clădirii.'];
  }

  return ['Utilizare mai simplă pentru fiecare zi.', 'Mai puțină risipă prin automatizare și programare.', 'Coordonare mai bună cu restul sistemelor smart.', 'Vizibilitate și control mai clare pentru utilizatori.'];
}

function buildRoApplicationBullets(page) {
  if (page.section === 'solutions') {
    return ['Proiecte noi care au nevoie de o arhitectură smart clară.', 'Renovări unde integrarea trebuie făcută cu perturbări minime.', 'Clădiri comerciale sau rezidențiale cu mai multe sisteme conectate.', 'Proiecte care au nevoie de suport și optimizare pe termen lung.'];
  }

  if (page.section === 'buildings') {
    return ['Ocupanți: confort și control adaptate rutinei zilnice.', 'Operatori: administrare centralizată pentru sistemele conectate.', 'Echipe tehnice: monitorizare mai clară, alerte și intervenții mai rapide.', 'Proprietari: eficiență, siguranță și valoare mai bună a clădirii.'];
  }

  return ['Planificare: definirea cerințelor înainte de instalare.', 'Integrare: conectarea funcției cu sistemul smart building complet.', 'Operare: setări clare pentru utilizatori și administratori.', 'Extindere: adăugarea de scenarii și funcții pe măsură ce proiectul evoluează.'];
}

function buildRoTabs(page) {
  const steps = buildRoSteps(page);
  const featureNamesRo = roHumanList((page.features || []).slice(0, 4).map((feature) => feature.title).filter(Boolean));

  return TAB_IDS.map((id) => {
    if (id === 'how-it-works') {
      return {
        id,
        label: RO_TAB_LABELS[id],
        title: page.section === 'solutions' ? `${page.title}: proces` : `Cum funcționează ${roPageNoun(page)}`,
        body: page.section === 'solutions'
          ? clampWords(page.longForm?.[1] || `${page.title} urmează un proces clar de analiză, proiectare, validare și predare.`, 95)
          : `${page.sectionHeading} prin ${featureNamesRo || 'funcții coordonate'}. Sistemul poate fi controlat local, din aplicație sau automat, prin senzori, programe și scenarii.`,
        steps,
      };
    }

    if (id === 'what-is-included') {
      return {
        id,
        label: RO_TAB_LABELS[id],
        title: page.sectionHeading || 'Ce este inclus',
        body: sentenceFrom(page.heroDescription || page.supportingHeadline),
        bullets: buildRoIncludedBullets(page),
      };
    }

    if (id === 'key-benefits') {
      return {
        id,
        label: RO_TAB_LABELS[id],
        title: page.resultLine || 'De ce contează',
        body: `${page.title} este valoros atunci când confortul, eficiența, siguranța și controlul trebuie să funcționeze împreună, fără complexitate pentru utilizatori.`,
        bullets: buildRoBenefitBullets(page),
      };
    }

    return {
      id,
      label: RO_TAB_LABELS[id],
      title: `Unde se potrivește ${roPageNoun(page)}`,
      body: `${page.title} se adaptează tipului de clădire, rutinei zilnice, permisiunilor de control și extinderilor viitoare.`,
      bullets: buildRoApplicationBullets(page),
    };
  });
}

function toPublicDetailPageRo(page) {
  return {
    id: page.slug,
    slug: page.slug,
    title: page.title,
    navigationTitle: page.menuLabel || page.title,
    category: page.section,
    label: RO_CATEGORY_LABELS[page.section] || page.section,
    detailHeading: roDetailHeadingByCategory[page.section]?.(page) || page.sectionHeading,
    introduction: buildRoIntroduction(page),
    tabs: buildRoTabs(page),
    image: {
      src: null,
      alt: page.imageDirection || page.title,
    },
    cta: {
      label: stripTrailingArrow(page.section === 'solutions' ? 'Discută cu noi' : page.closingCta || page.primaryCta || 'Configurează un proiect'),
      href: page.section === 'solutions' ? `/contact?service=${page.slug}` : '/configurator',
    },
    overviewDescription: clampWords(page.heroDescription || page.supportingHeadline, 34),
    route: page.route,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    tags: RO_TAGS_BY_CATEGORY[page.section],
    hideCta: page.section === 'technology',
  };
}

function stripTrailingArrow(label = '') {
  return label.replace(/\s*(->|\u2192)\s*$/, '').trim();
}

function stripEnding(text = '') {
  return String(text).trim().replace(/[.!?;:,]*$/, '');
}

function sentenceFrom(text = '') {
  const match = String(text).trim().match(/^(.+?[.!?])(?:\s|$)/);
  return match?.[1] || text;
}

function humanList(items = []) {
  const clean = items.map(stripEnding).filter(Boolean);
  if (clean.length <= 1) return clean[0] || '';
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')} and ${clean.at(-1)}`;
}

function featureNames(page, limit = 6) {
  return (page.features || []).slice(0, limit).map((feature) => feature.title);
}

function pageNoun(page) {
  return (page.menuLabel || page.title || '').toLowerCase();
}

function sourceIdea(page) {
  const source = page.longForm?.[0] || '';
  const match = source.match(/Green Electric connects\s+(.*?)\s+into one intelligent infrastructure/i);
  if (match?.[1]) return match[1].replace(/\s+/g, ' ').trim();
  return humanList(featureNames(page, 5));
}

function extractAdvantageList(page) {
  const source = page.longForm?.[2] || page.resultLine || page.heroDescription;
  const advantageMatch = source.match(/advantages are strong:\s*(.*?)(?:\.\s*Because|\.\s*The measurable|$)/i);
  const measurableMatch = source.match(/measurable benefits include\s+(.*?)(?:\.|$)/i);
  const listSource = [advantageMatch?.[1], measurableMatch?.[1]].filter(Boolean).join(', ');
  const candidates = listSource
    .split(/,\s+|;\s+|\s+and\s+/i)
    .map((item) => stripEnding(item.replace(/^the\s+/i, '')))
    .filter((item) => item.length > 12);

  const fallback = (page.features || []).map((feature) => stripEnding(feature.description));
  return [...new Set(candidates.length ? candidates : fallback)].slice(0, 5);
}

function extractAudiences(page) {
  const source = page.longForm?.[0] || '';
  const match = source.match(/For\s+(.*?)(?:\s+who\s+|\s+that\s+|,\s*this means)/i);
  if (!match?.[1]) return [];
  return match[1]
    .replace(/\s+and\s+/gi, ', ')
    .split(',')
    .map((item) => stripEnding(item).trim())
    .filter((item) => item.length > 2)
    .slice(0, 5);
}

function buildIntroduction(page) {
  const integratedScope = sourceIdea(page);
  const base = page.section === 'technology'
    ? `${page.supportingHeadline} Green Electric plans ${pageNoun(page)} around ${integratedScope}, so the function works as part of the wider building system rather than as isolated equipment. ${page.heroDescription}`
    : page.section === 'buildings'
      ? `${page.supportingHeadline} For ${pageNoun(page)}, Green Electric coordinates ${integratedScope} in one practical control layer. ${page.heroDescription}`
      : `${page.supportingHeadline} Green Electric turns requirements into a coordinated project scope around ${integratedScope}. ${page.heroDescription}`;

  return clampWords(base, 115);
}

function buildSteps(page) {
  if (page.section === 'solutions' && solutionProcesses[page.slug]) return solutionProcesses[page.slug];

  return (page.features || []).slice(0, 4).map((feature, index) => ({
    number: index + 1,
    title: feature.title,
    description: feature.description,
  }));
}

function buildIncludedBullets(page) {
  return (page.features || []).map((feature) => `${feature.title}: ${feature.description}`);
}

function buildHowItWorksBody(page) {
  const names = humanList(featureNames(page, 6));
  if (page.section === 'technology') {
    return `${page.sectionHeading} through ${names}. Each function can be controlled locally, from the app or automatically through sensors, schedules and scenes, then connected with the other systems in the building.`;
  }

  if (page.section === 'buildings') {
    return `${page.sectionHeading}: ${names}. The system is configured around the way the space is used, with different zones, permissions, routines and operating priorities for occupants and managers.`;
  }

  return clampWords(page.longForm?.[1] || `${page.sectionHeading}: ${names}.`, 95);
}

function buildBenefitBody(page) {
  const benefits = extractAdvantageList(page);
  if (benefits.length) {
    return `${page.title} is valuable when ${humanList(benefits.slice(0, 3)).toLowerCase()} matter in daily operation. The system keeps the experience simple for users while giving owners better visibility and control.`;
  }
  return page.resultLine || page.heroDescription;
}

function buildBenefitBullets(page) {
  return extractAdvantageList(page).map((item) => `${item}.`);
}

function buildApplicationBullets(page) {
  const audiences = extractAudiences(page);
  const features = featureNames(page, 4);
  const benefits = extractAdvantageList(page);

  if (audiences.length) {
    return audiences.slice(0, 4).map((audience, index) => {
      const feature = features[index % features.length] || page.title;
      const benefit = benefits[index % benefits.length] || page.supportingHeadline;
      return `${audience}: ${feature} supports ${stripEnding(benefit).toLowerCase()}.`;
    });
  }

  if (page.section === 'buildings') {
    return [
      `Occupants: ${page.supportingHeadline}`,
      `Operators: central control for ${humanList(features.slice(0, 3)).toLowerCase()}.`,
      `Facility teams: clearer monitoring, permissions and service planning.`,
    ];
  }

  return [
    `Project planning: define ${pageNoun(page)} requirements before installation.`,
    `Integration: connect ${humanList(features.slice(0, 3)).toLowerCase()} with the wider automation system.`,
    `Operation: keep settings simple for users and visible for administrators.`,
  ];
}

function buildApplicationBody(page) {
  const audiences = extractAudiences(page);
  if (audiences.length) {
    return `${page.title} is most useful for ${humanList(audiences)}, with the final scope adapted to building type, daily routines, control permissions and future expansion needs.`;
  }

  if (page.section === 'buildings') {
    return `${page.title} projects need a balance between occupant comfort and operator control. Green Electric adapts the system to daily use, safety needs, energy visibility and maintenance responsibilities.`;
  }

  return `${page.title} supports projects that need a clear path from requirements to a working smart building system, with scope adapted to the building, budget and long-term operating model.`;
}

function buildTabs(page) {
  const steps = buildSteps(page);

  return TAB_IDS.map((id) => {
    if (id === 'how-it-works') {
      return {
        id,
        label: TAB_LABELS[id],
        title: page.section === 'solutions' ? `${page.title} process` : `How ${pageNoun(page)} works`,
        body: buildHowItWorksBody(page),
        steps,
      };
    }

    if (id === 'what-is-included') {
      return {
        id,
        label: TAB_LABELS[id],
        title: page.sectionHeading || `What is included`,
        body: sentenceFrom(page.heroDescription || page.supportingHeadline),
        bullets: buildIncludedBullets(page),
      };
    }

    if (id === 'key-benefits') {
      return {
        id,
        label: TAB_LABELS[id],
        title: page.resultLine || `Why it matters`,
        body: buildBenefitBody(page),
        bullets: buildBenefitBullets(page),
      };
    }

    return {
      id,
      label: TAB_LABELS[id],
      title: `Where ${pageNoun(page)} fits`,
      body: buildApplicationBody(page),
      bullets: buildApplicationBullets(page),
    };
  });
}


function mergeTabs(baseTabs, tabOverrides = {}) {
  return baseTabs.map((tab) => {
    const override = tabOverrides[tab.id];
    if (!override) return tab;
    return {
      ...tab,
      ...override,
      steps: override.steps ?? tab.steps,
      bullets: override.bullets ?? tab.bullets,
    };
  });
}

function toPublicDetailPage(page) {
  if (isRomanianPage(page)) return toPublicDetailPageRo(page);

  const override = SPEC_DETAIL_OVERRIDES[page.section]?.[page.slug] || {};

  return {
    id: page.slug,
    slug: page.slug,
    title: override.title || page.title,
    navigationTitle: override.navigationTitle || page.menuLabel || page.title,
    category: page.section,
    label: CATEGORY_LABELS[page.section] || page.section,
    detailHeading: override.detailHeading || detailHeadingByCategory[page.section]?.(page) || page.sectionHeading,
    introduction: override.introduction || buildIntroduction(page),
    tabs: mergeTabs(buildTabs(page), override.tabs),
    image: {
      src: null,
      alt: page.imageDirection || page.title,
    },
    cta: {
      label: stripTrailingArrow(page.section === 'solutions' ? 'Contact Us' : page.closingCta || page.primaryCta),
      href: page.section === 'solutions' ? `/contact?service=${page.slug}` : '/configurator',
    },
    overviewDescription: clampWords(page.heroDescription || page.supportingHeadline, 34),
    route: page.route,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    tags: override.tags,
    hideCta: override.hideCta,
  };
}

export function createPublicRegistry(pages = {
  technology: technologyPages,
  buildings: buildingPages,
  solutions: solutionPages,
}) {
  return {
    technology: pages.technology.map(toPublicDetailPage),
    buildings: pages.buildings.map(toPublicDetailPage),
    solutions: pages.solutions.map(toPublicDetailPage),
  };
}

export const publicPageRegistry = createPublicRegistry();

export const technologies = publicPageRegistry.technology;
export const buildingTypes = publicPageRegistry.buildings;
export const solutions = publicPageRegistry.solutions;

export function getPublicItems(category, registry = publicPageRegistry) {
  return getCollectionByCategory(registry, category);
}

export function findPublicPage(category, slug, registry = publicPageRegistry) {
  return getPublicItems(category, registry).find((page) => page.slug === slug);
}

export function getPublicPager(category, currentSlug, registry = publicPageRegistry) {
  const config = CATEGORY_CONFIG[category];
  return getPagerState(getPublicItems(category, registry), currentSlug, config?.overviewRoute || '/');
}

export { CATEGORY_CONFIG };