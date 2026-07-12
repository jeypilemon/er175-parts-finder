let currentTab = "aftermarket";
let currentCategory = "All";
let globalKeyword = "";

let currentViewerComponent = null;
let currentViewerIndex = 0;

let currentViewerMode = "";
let currentComponentIndex = 0;
let currentDashboardIndex = 0;

let viewerMode = "";
viewerMode="dashboard";
viewerMode="component";

let currentEFIProblem = null;
let currentEFISteps = [];
let currentEFIStepIndex = 0;

let efiFilter = "All";
let efiSearch = "";

let manualSearch = "";
let manualData = [];
let manualComponents = [];
let manualDashboard = [];
let manualMaintenance = [];
let manualWiring = [];
let manualPrecautions = [];
let manualMistakes = [];
let efiData = [];


let aftermarketParts = [];
let oemParts = [];
let troubleshootData = [];

let isLoading = true;

const loaded = {
    aftermarket: false,
    oem: false,
    troubleshoot: false,
    manual: false,
    components:false

};

const container = document.getElementById("products");
const chips = document.getElementById("chips");