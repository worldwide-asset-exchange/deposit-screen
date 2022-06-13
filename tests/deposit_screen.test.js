const {
  setupTestChain,
  createAccount,
  setContract,
  transfer,
  getTableRows,
  genericAction,
} = require('@waxio/waxunit');

function activePerm(actor, permission = 'active') {
  return { actor, permission };
}

describe('min-transfer', () => {
  const admin = 'admin';
  const user1 = 'user1';
  const user2 = 'user2';
  const adminPerm = activePerm(admin);
  const user1Perm = activePerm(user1);
  const user2Perm = activePerm(user2);
  const eosioTokenPerm = activePerm('eosio.token');

  beforeAll(async () => {
    await setupTestChain();

    await Promise.all([createAccount(admin), createAccount(user1), createAccount(user2)]);

    await Promise.all([
      transfer('eosio', admin, '1.00000000 WAX', 'init'),
      transfer('eosio', user1, '100.00000000 WAX', 'init'),
      transfer('eosio', user2, '100.00000000 WAX', 'init'),
      genericAction(
        'eosio.token',
        'create',
        {
          issuer: admin,
          maximum_supply: '10000000.0000 TMP',
        },
        [eosioTokenPerm, adminPerm]
      ),
    ]);

    await genericAction(
      'eosio.token',
      'issue',
      {
        to: admin,
        quantity: '100000.0000 TMP',
        memo: 'issue 100000 TMP',
      },
      [eosioTokenPerm, adminPerm]
    );

    await setContract(admin, 'build/deposit_screen.wasm', 'build/deposit_screen.abi');
  });

  describe('init', () => {
    it('should init the configuration', async () => {
      let global = await getTableRows(admin, 'global', admin);
      expect(global).toEqual([]);

      await genericAction(admin, 'init', {}, [adminPerm]);
      global = await getTableRows(admin, 'global', admin);
      expect(global.length).toBe(1);
      expect(global[0]).toEqual({ min: '0.00000000 WAX', version: '1.0.0' });
    });

    it('should throw error if call is not admin', async () => {
      await expect(genericAction(admin, 'init', {}, [user1Perm])).rejects.toThrowError(
        `missing authority of ${admin}`
      );

      await expect(genericAction(admin, 'init', {}, [user2Perm])).rejects.toThrowError(
        `missing authority of ${admin}`
      );
    });
  });

  describe('setmin', () => {
    it('should throw error if no admin', async () => {
      await expect(
        genericAction(
          admin,
          'setmin',
          {
            min: '5.00000000 WAX',
          },
          [user1Perm]
        )
      ).rejects.toThrowError(`missing authority of ${admin}`);
    });

    it('should throw error if value is negative', async () => {
      await expect(
        genericAction(
          admin,
          'setmin',
          {
            min: '-0.00000001 WAX',
          },
          [adminPerm]
        )
      ).rejects.toThrowError(`Min value should be positive`);
    });

    it('should set the minimum transfer quantity', async () => {
      await expect(
        genericAction(
          admin,
          'setmin',
          {
            min: '1.99999999 WAX',
          },
          [adminPerm]
        )
      ).resolves.toEqual(
        expect.objectContaining({
          transaction_id: expect.any(String),
        })
      );

      const global = await getTableRows(admin, 'global', admin);
      expect(global[0]).toEqual({ min: '1.99999999 WAX', version: '1.0.0' });
    });
  });

  describe('listen on transfer quantity', () => {
    it('should success with transferring greater than or equal to 1.99999999 WAX', async () => {
      await expect(transfer(user1, admin, '2.00000000 WAX', 'should pass')).resolves.toBeTruthy();
      await expect(transfer(user2, admin, '1.99999999 WAX', 'should pass')).resolves.toBeTruthy();
    });

    it('should fail if transfer number less than 1.99999999 WAX', async () => {
      await expect(transfer(user1, admin, '1.00000000 WAX', 'should fail')).rejects.toThrowError(
        'Quantity must be greater than or equal to 1.99999999 WAX'
      );
      await expect(transfer(user2, admin, '1.99999998 WAX', 'should fail')).rejects.toThrowError(
        'Quantity must be greater than or equal to 1.99999999 WAX'
      );
    });

    it('admin should transfer normally', async () => {
      await expect(transfer(admin, user1, '2.00000000 WAX', 'should pass')).resolves.toBeTruthy();
      await expect(transfer(admin, user2, '1.00000000 WAX', 'should pass')).resolves.toBeTruthy();
    });
  });

  describe('transfer other token', () => {
    it('should transfer TMP token from admin to user', async () => {
      await expect(transfer(admin, user1, '2.0000 TMP', 'should pass')).resolves.toBeTruthy();
      await expect(transfer(admin, user1, '2000.0000 TMP', 'should pass')).resolves.toBeTruthy();
      await expect(transfer(admin, user2, '1.0000 TMP', 'should pass')).resolves.toBeTruthy();
      await expect(transfer(admin, user2, '1000.0000 TMP', 'should pass')).resolves.toBeTruthy();
    });

    it('should transfer TMP token from user to admin', async () => {
      await expect(transfer(user1, admin, '2.0000 TMP', 'should pass')).rejects.toThrowError(
        'Only accept token with symbol name: WAX'
      );
      await expect(transfer(user2, admin, '1.0000 TMP', 'should pass')).rejects.toThrowError(
        'Only accept token with symbol name: WAX'
      );
    });

    it('should transfer TMP token from user to user', async () => {
      await expect(transfer(user1, user2, '2.0000 TMP', 'should pass')).resolves.toBeTruthy();
      await expect(transfer(user2, user1, '1.0000 TMP', 'should pass')).resolves.toBeTruthy();
    });
  });
});
