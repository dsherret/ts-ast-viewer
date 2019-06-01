import { visitSite } from "../helpers";

// this file exists because the CI kept failing...

describe("setup", () => {
    Cypress.env("RETRIES", 4);

    it("should navigate to the website", () => {
        visitSite();
    });
});
