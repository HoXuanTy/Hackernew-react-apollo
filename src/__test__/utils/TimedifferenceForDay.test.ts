import timeDifferenceForDay from "../../utils/TimeDifferenceForDay";


describe('test time difference for day', () => {
  
        test('should return "Just Now" when the date is the current date', () => {
            const currentDate = new Date();
            const result = timeDifferenceForDay(currentDate);
            expect(result).toBe('Just Now');
        });

        test('should return "20 seconds ago" when the time is 20 seconds ago', () => {
            const currentDate = new Date();
            currentDate.setSeconds(currentDate.getSeconds() - 20)
            const result = timeDifferenceForDay(currentDate);
            expect(result).toBe('20 seconds ago');
        })

        test('should return "2 min ago" when the time is 2 min ago', () => {
            const currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() - 2)
            const result = timeDifferenceForDay(currentDate);
            expect(result).toBe('2 min ago');
        })

        test('should return "1 hours ago" when the time is 1 hours ago', () => {
            const currentDate = new Date();
            currentDate.setHours(currentDate.getHours() - 1)
            const result = timeDifferenceForDay(currentDate);
            expect(result).toBe('1 hours ago');
        })

        test('should return "1 day ago" when the time is 1 day ago', () => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - 1)
            const result = timeDifferenceForDay(currentDate);
            expect(result).toBe('1 day ago');
        })
        
        test('should return "1 week ago" when the time is 1 week ago', () => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - 7)
            const result = timeDifferenceForDay(currentDate);
            expect(result).toBe('1 week ago');
        })

        test('should return "2 month ago" when the time is 2 month hours ago', () => {
            const currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() - 2)
            const result = timeDifferenceForDay(currentDate);
            expect(result).toBe('2 month ago');
        })

        test('should return "12 month ago" when the time is 1 years ago', () => {
            const currentDate = new Date();
            currentDate.setFullYear(currentDate.getFullYear() - 1)
            const result = timeDifferenceForDay(currentDate);
            expect(result).toBe('12 month ago');
            
        })

})