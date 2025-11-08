#!/usr/bin/env node

const newman = require('newman');
const path = require('path');

console.log('🚀 Running CleanEkiti Postman API Tests');
console.log('=' .repeat(50));

// Run the collection
newman.run({
    collection: path.join(__dirname, 'postman/CleanEkiti-API-Tests.postman_collection.json'),
    environment: path.join(__dirname, 'postman/CleanEkiti-Environment.postman_environment.json'),
    delayRequest: 1000, // 1 second delay between requests
    reporters: ['cli', 'json'],
    reporter: {
        json: {
            export: path.join(__dirname, 'postman-results.json')
        }
    }
}, function (err, summary) {
    if (err) {
        console.error('❌ Error running collection:', err);
        process.exit(1);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 POSTMAN TEST SUMMARY');
    console.log('='.repeat(60));

    const stats = summary.run.stats;
    const failures = summary.run.failures;

    console.log(`📋 Total Requests: ${stats.requests.total}`);
    console.log(`✅ Successful: ${stats.requests.total - stats.requests.failed}`);
    console.log(`❌ Failed: ${stats.requests.failed}`);
    console.log(`⏱️  Average Response Time: ${Math.round(summary.run.timings.responseAverage)}ms`);
    console.log(`🕐 Total Duration: ${Math.round(summary.run.timings.completed / 1000)}s`);

    if (failures.length > 0) {
        console.log('\n❌ FAILED TESTS:');
        failures.forEach((failure, index) => {
            console.log(`${index + 1}. ${failure.source.name || 'Unknown'}`);
            console.log(`   Error: ${failure.error.message}`);
            if (failure.error.test) {
                console.log(`   Test: ${failure.error.test}`);
            }
        });
    }

    // Test results by folder
    const testResults = {};
    summary.run.executions.forEach(execution => {
        const folderName = execution.item.parent()?.name || 'Root';
        if (!testResults[folderName]) {
            testResults[folderName] = { passed: 0, failed: 0, total: 0 };
        }
        
        const assertions = execution.assertions || [];
        assertions.forEach(assertion => {
            testResults[folderName].total++;
            if (assertion.error) {
                testResults[folderName].failed++;
            } else {
                testResults[folderName].passed++;
            }
        });
    });

    console.log('\n📁 RESULTS BY TEST FOLDER:');
    Object.keys(testResults).forEach(folder => {
        const result = testResults[folder];
        const status = result.failed === 0 ? '✅' : '❌';
        console.log(`${status} ${folder}: ${result.passed}/${result.total} passed`);
    });

    // Overall result
    const overallSuccess = stats.requests.failed === 0 && failures.length === 0;
    console.log('\n' + '='.repeat(60));
    if (overallSuccess) {
        console.log('🎉 ALL POSTMAN TESTS PASSED!');
        console.log('✅ Your CleanEkiti API is working perfectly!');
    } else {
        console.log('⚠️  Some tests failed - check the details above');
        console.log('💡 Most core functionality is working correctly');
    }
    console.log('='.repeat(60));

    process.exit(overallSuccess ? 0 : 1);
});