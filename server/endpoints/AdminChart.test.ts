import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";

import axios from 'axios';
import { TokenPayload } from 'google-auth-library';

import { Review } from 'common';
import { configure } from "../endpoints";
import { Classes, Reviews, Students, Subjects } from "../dbDefs";
import * as Auth from "./Auth";

let mongoServer: MongoMemoryServer;
let serverCloseHandle;

const testingPort = 8090;

export const testClasses = [
  {
    _id: "oH37S3mJ4eAsktypy",
    classSub: "cs",
    classNum: "2110",
    classTitle: "Object-Oriented Programming and Data Structures",
    classPrereq: [],
    classFull: "cs 2110 object-oriented programming and data structures",
    classSems: ["FA14", "SP15", "SU15", "FA15", "SP16", "SU16", "FA16", "SP17",
      "SU17", "FA17", "SP18", "FA18", "SU18", "SP19", "FA19", "SU19"],
    crossList: ["q75SxmqkTFEfaJwZ3"],
    classProfessors: ["David Gries", "Douglas James", "Siddhartha Chaudhuri",
      "Graeme Bailey", "John Foster", "Ross Tate", "Michael George",
      "Eleanor Birrell", "Adrian Sampson", "Natacha Crooks", "Anne Bracy",
      "Michael Clarkson"],
    classDifficulty: 2.9,
    classRating: null,
    classWorkload: 3,
  },
  {
    _id: "oH37S3mJ4eAsdsdpy",
    classSub: "cs",
    classNum: "2112",
    classTitle: "Honors Object-Oriented Programming and Data Structures",
    classPrereq: [],
    classFull: "cs 2112 Honors object-oriented programming and data structures",
    classSems: ["FA14", "SP15", "SU15", "FA15", "SP16", "SU16", "FA16", "SP17",
      "SU17", "FA17", "SP18", "FA18", "SU18", "SP19", "FA19", "SU19"],
    crossList: [],
    classProfessors: ["Andrew Myers"],
    classDifficulty: 5.0,
    classRating: null,
    classWorkload: 5.0,
  },
  {
    _id: "fhgweiufhwu23",
    classSub: "math",
    classNum: "3110",
    classTitle: "Intro to real analysis",
    classPrereq: [],
    classFull: "math 3110 Intro to real analysis",
    classSems: ["FA14", "SP15", "SU15", "FA15", "SP16", "SU16", "FA16", "SP17",
      "SU17", "FA17", "SP18", "FA18", "SU18", "SP19", "FA19", "SU19"],
    crossList: [],
    classProfessors: ["Saloff-Coste"],
    classDifficulty: 3.9,
    classRating: null,
    classWorkload: 3.5,
  },
];

// inital reviews that are present at start of all tests.
export const testReviews = [
  {
    _id: "4Y8k7DnX3PLNdwRPr",
    text: "review text for cs 2110",
    difficulty: 1,
    quality: 4,
    class: "oH37S3mJ4eAsktypy",
    grade: 6,
    date: new Date().toISOString(),
    atten: 0,
    visible: 1,
    reported: 0,
  },
  {
    _id: "4Y8k7DnX3PLNdwRPq",
    text: "review text for cs 2110 number 2",
    difficulty: 1,
    quality: 5,
    class: "oH37S3mJ4eAsktypy",
    grade: 6,
    date: new Date().toISOString(),
    atten: 0,
    visible: 1,
    reported: 0,
  },
  {
    _id: "4Y8k7rthjX3PLNdwRPq",
    text: "review 1 for cs 2112",
    difficulty: 5,
    quality: 5,
    class: "oH37S3mJ4eAsdsdpy",
    grade: 6,
    date: new Date().toISOString(),
    atten: 0,
    visible: 1,
    reported: 0,
  },
  {
    _id: "4Y8k7rthjX3PLNdwjhgfuytRPq",
    text: "review 1 for math 3110",
    difficulty: 5,
    quality: 5,
    class: "fhgweiufhwu23",
    grade: 6,
    date: new Date().toISOString(),
    atten: 0,
    visible: 1,
    reported: 0,
  },
];

const testSubjects = [
  {
    _id: "cs57687980g",
    subShort: "cs",
    subFull: "Computer Science",
  },
  {
    _id: "math234jhgheyr389",
    subShort: "math",
    subFull: "Mathematics",
  },
];

const validTokenPayload: TokenPayload = {
  email: 'dti1@cornell.edu',
  iss: undefined,
  sub: undefined,
  iat: undefined,
  aud: undefined,
  exp: undefined,
  hd: "cornell.edu",
};

const testUsers = [
  {
    _id: "Irrelevant2",
    firstName: "Dan Thomas",
    lastName: "Ivy",
    netId: "dti1",
    affiliation: null,
    token: "fakeTokenDti1",
    privilege: "admin",
  },
];

const mockVerificationTicket = jest.spyOn(Auth, 'getVerificationTicket')
  .mockImplementation(async (token: string) => validTokenPayload);

beforeAll(async () => {
  // get mongoose all set up
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  await Promise.all(
    testClasses.map(async (c) => await (new Classes(c).save())),
  );

  await Promise.all(
    testReviews.map(async (r) => await (new Reviews(r).save())),
  );

  await Promise.all(
    testUsers.map(async (u) => await (new Students(u).save())),
  );

  await Promise.all(
    testSubjects.map(async (s) => await (new Subjects(s).save())),
  );

  // Set up a mock version of the v2 endpoints to test against
  const app = express();
  serverCloseHandle = app.listen(testingPort, async () => { });
  configure(app);
});

afterAll(async () => {
  await mockVerificationTicket.mockRestore();
  await mongoose.disconnect();
  await mongoServer.stop();
  await serverCloseHandle.close();
});

describe('tests', () => {
  it('totalReviews', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/totalReviews`, { token: "token" });
    expect(res.data.result).toBe(testReviews.length);
  });

  it("howManyReviewsEachClass", async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/howManyReviewsEachClass`, { token: "token" });
    const match = [{ _id: 'cs 2110', total: 2 }, { _id: "cs 2112", total: 1 }, { _id: "math 3110", total: 1 }];
    match.forEach((obj) => {
      expect(res.data.result).toContainEqual(obj);
    });
  });

  it("howManyEachClass", async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/howManyEachClass`, { token: "token" });
    const match = [{ _id: 'cs', total: 2 }, { _id: "math", total: 1 }];
    match.forEach((obj) => {
      expect(res.data.result).toContainEqual(obj);
    });
  });

  it("topSubjects", async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/topSubjects`, { token: "token" });
    const match = [['Computer Science', 3], ['Mathematics', 1]];
    match.forEach((obj) => {
      expect(res.data.result).toContainEqual(obj);
    });
  });
});
