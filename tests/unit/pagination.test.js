import getPagination from "../../src/utils/pagination.js";

describe("getPagination", () => {
    test("should return default pagination values", () => {
        const result = getPagination({});

        expect(result).toEqual({
            page: 1,
            limit: 20,
            skip: 0,
        });
    });

    test("should calculate skip correctly for given page and limit", () => {
        const result = getPagination({
            page: 2,
            limit: 10,
        });

        expect(result).toEqual({
            page: 2,
            limit: 10,
            skip: 10,
        });
    });

    test("should calculate skip correctly for page 3", () => {
        const result = getPagination({
            page: 3,
            limit: 20,
        });

        expect(result).toEqual({
            page: 3,
            limit: 20,
            skip: 40,
        });
    });
});