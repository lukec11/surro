import queryCell from '../queryCell';
import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { describe, it } from 'mocha';

describe('queryCell', () => {
  it('should return cell data for valid inputs', async () => {
    const result = await queryCell(310, 410, 142089743, 34647);
    expect(result).to.be.an('array').and.to.have.lengthOf.above(0);
  });

  it('should throw an error for invalid (too high) inputs', async () => {
    try {
      await queryCell(999, 999, 99999999, 99999);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should throw an error for invalid (bad TAC) inputs', async () => {
    try {
      await queryCell(310, 410, 142089743, 999);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should throw an error for invalid (decommissioned) inputs', async () => {
    try {
      await queryCell(310, 410, 142089736, 34647);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });

  it('should throw an error when the server fails to respond', async () => {
    // Create mock response
    const mockResponse = new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });

    // Stub fetch to return the mock Response
    const fetchStub = sinon.stub(global, 'fetch');
    fetchStub.resolves(mockResponse);

    try {
      await queryCell(310, 410, 999, 99999);
      expect(true).to.equal(false);
    } catch (error) {
      expect(error).to.be.an('error');
    }

    // Restore fetch to original functionality
    fetchStub.restore();
  });
});
