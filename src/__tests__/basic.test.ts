describe('Basic Test Suite', () => {
  describe('Math operations', () => {
    it('should add numbers correctly', () => {
      expect(2 + 2).toBe(4);
      expect(5 + 3).toBe(8);
      expect(-1 + 1).toBe(0);
    });

    it('should multiply numbers correctly', () => {
      expect(3 * 4).toBe(12);
      expect(0 * 5).toBe(0);
      expect(-2 * 3).toBe(-6);
    });

    it('should handle floating point arithmetic', () => {
      expect(0.1 + 0.2).toBeCloseTo(0.3);
      expect(3.14 * 2).toBeCloseTo(6.28);
    });
  });

  describe('String operations', () => {
    it('should concatenate strings', () => {
      expect('Hello' + ' ' + 'World').toBe('Hello World');
      expect(`${'test'} string`).toBe('test string');
    });

    it('should check string properties', () => {
      const testString = 'JavaScript';
      expect(testString.length).toBe(10);
      expect(testString.toUpperCase()).toBe('JAVASCRIPT');
      expect(testString.toLowerCase()).toBe('javascript');
    });

    it('should handle string methods', () => {
      expect('hello world'.includes('world')).toBe(true);
      expect('test'.repeat(3)).toBe('testtesttest');
      expect('  trim me  '.trim()).toBe('trim me');
    });
  });

  describe('Array operations', () => {
    it('should create and manipulate arrays', () => {
      const arr = [1, 2, 3];
      expect(arr.length).toBe(3);
      expect(arr[0]).toBe(1);
      expect(arr.includes(2)).toBe(true);
    });

    it('should use array methods correctly', () => {
      const numbers = [1, 2, 3, 4, 5];
      
      expect(numbers.filter(n => n > 3)).toEqual([4, 5]);
      expect(numbers.map(n => n * 2)).toEqual([2, 4, 6, 8, 10]);
      expect(numbers.reduce((sum, n) => sum + n, 0)).toBe(15);
    });

    it('should handle array find operations', () => {
      const items = [
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' },
        { id: 3, name: 'item3' }
      ];

      expect(items.find(item => item.id === 2)).toEqual({ id: 2, name: 'item2' });
      expect(items.some(item => item.name === 'item1')).toBe(true);
      expect(items.every(item => item.id > 0)).toBe(true);
    });
  });

  describe('Object operations', () => {
    it('should work with object properties', () => {
      const obj = { name: 'Test', value: 42, active: true };
      
      expect(obj.name).toBe('Test');
      expect(obj.value).toBe(42);
      expect(obj.active).toBe(true);
      expect(Object.keys(obj)).toEqual(['name', 'value', 'active']);
    });

    it('should handle object methods', () => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        getFullName() {
          return `${this.firstName} ${this.lastName}`;
        }
      };

      expect(user.getFullName()).toBe('John Doe');
    });

    it('should work with destructuring', () => {
      const config = { host: 'localhost', port: 3000, ssl: false };
      const { host, port } = config;
      
      expect(host).toBe('localhost');
      expect(port).toBe(3000);
    });
  });

  describe('Promise operations', () => {
    it('should resolve promises correctly', async () => {
      const promise = Promise.resolve('success');
      const result = await promise;
      
      expect(result).toBe('success');
    });

    it('should handle async/await', async () => {
      const asyncFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      };

      const result = await asyncFunction();
      expect(result).toBe('async result');
    });

    it('should handle promise rejection', async () => {
      const rejectedPromise = Promise.reject(new Error('test error'));
      
      await expect(rejectedPromise).rejects.toThrow('test error');
    });
  });

  describe('Date operations', () => {
    it('should work with dates', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });

    it('should compare dates', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      
      expect(date1 < date2).toBe(true);
      expect(date1.getTime()).toBeLessThan(date2.getTime());
    });
  });

  describe('Error handling', () => {
    it('should throw and catch errors', () => {
      const throwError = () => {
        throw new Error('Test error');
      };

      expect(throwError).toThrow('Test error');
      expect(throwError).toThrow(Error);
    });

    it('should handle try/catch blocks', () => {
      let caught = false;
      
      try {
        throw new Error('Caught error');
      } catch (error) {
        caught = true;
        expect(error).toBeInstanceOf(Error);
      }
      
      expect(caught).toBe(true);
    });
  });

  describe('Type checking', () => {
    it('should check types correctly', () => {
      expect(typeof 'string').toBe('string');
      expect(typeof 42).toBe('number');
      expect(typeof true).toBe('boolean');
      expect(typeof {}).toBe('object');
      expect(typeof []).toBe('object');
      expect(Array.isArray([])).toBe(true);
    });

    it('should handle null and undefined', () => {
      expect(null).toBeNull();
      expect(undefined).toBeUndefined();
      expect(null == undefined).toBe(true);
      expect(null === undefined).toBe(false);
    });
  });

  describe('Regular expressions', () => {
    it('should test regex patterns', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('test@example.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
    });

    it('should extract matches', () => {
      const text = 'Phone: 123-456-7890';
      const phoneRegex = /(\d{3})-(\d{3})-(\d{4})/;
      const match = text.match(phoneRegex);
      
      expect(match).toBeTruthy();
      expect(match![1]).toBe('123');
      expect(match![2]).toBe('456');
      expect(match![3]).toBe('7890');
    });
  });

  describe('JSON operations', () => {
    it('should serialize and deserialize JSON', () => {
      const obj = { name: 'Test', value: 42, items: [1, 2, 3] };
      const json = JSON.stringify(obj);
      const parsed = JSON.parse(json);
      
      expect(parsed).toEqual(obj);
      expect(typeof json).toBe('string');
    });

    it('should handle JSON errors', () => {
      expect(() => JSON.parse('invalid json')).toThrow();
    });
  });
});